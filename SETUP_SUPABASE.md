# Supabase Setup Guide

**Last Updated**: 2025-11-24
**Schema Version**: 20250123000001

## Overview

This guide walks you through setting up Supabase for the MindForge Academy learning platform. Supabase provides:
- PostgreSQL database with Row Level Security (RLS)
- Authentication (email/password, OAuth providers)
- Real-time subscriptions
- Auto-generated REST API
- Storage for user avatars and audio files

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available at [supabase.com](https://supabase.com))
- Git

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose organization
4. Enter project details:
   - **Name**: MindForge Academy (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

5. Click **Create new project**
6. Wait 2-3 minutes for project provisioning

### 2. Get API Credentials

Once project is ready:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (safe to use in client-side code)

### 3. Configure Environment Variables

Create `.env.local` in project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local`:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Security Notes:**
- ✅ `VITE_SUPABASE_ANON_KEY` is safe for client-side use (RLS policies protect data)
- ❌ **NEVER** commit `.env.local` to Git
- ❌ **NEVER** expose service role key in client code

### 4. Apply Database Schema

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New query**
3. Copy contents of `infrastructure/supabase/schema.sql`
4. Paste into SQL Editor
5. Click **Run** (⌘/Ctrl + Enter)
6. Verify success (you should see "Success. No rows returned")

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref xxxxx

# Apply migrations
supabase db push
```

### 5. Verify Schema

Check that all tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see 9 tables:
   - `profiles`
   - `user_settings`
   - `topics`
   - `learning_paths`
   - `tasks`
   - `user_progress`
   - `practice_sessions`
   - `answer_history`
   - `spaced_repetition`

### 6. Seed Initial Data

Seed the database with topics, learning paths, and tasks:

```bash
npm run seed:supabase
```

This creates:
- 4 topics (Math, Biology, English, Spanish)
- Multiple learning paths per topic
- Sample tasks for each learning path

### 7. Test Authentication

Create a test user:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**

Or sign up through the app:

```bash
npm run dev
# Navigate to signup page
# Create account with email/password
```

### 8. Verify Setup

Run the application:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and:
1. ✅ Sign in with test user
2. ✅ View topics on dashboard
3. ✅ Start a learning path
4. ✅ Answer a few tasks
5. ✅ Check progress is saved

---

## Database Schema

The schema includes 9 tables organized into three groups:

### User Management
- **profiles** - User profile information
- **user_settings** - User preferences and configuration

### Learning Content
- **topics** - Subject areas (Math, Biology, etc.)
- **learning_paths** - Collections of tasks within topics
- **tasks** - Individual learning items

### User Progress
- **user_progress** - Progress tracking per learning path
- **practice_sessions** - Active and completed sessions
- **answer_history** - Record of all answers
- **spaced_repetition** - SM-2 algorithm scheduling

See [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) for complete schema documentation with ERD.

---

## Row Level Security (RLS)

All tables have RLS enabled for multi-user data isolation:

### Security Model

| Table | User Access | Notes |
|-------|-------------|-------|
| profiles | Read all, modify own | Public profiles, private edits |
| user_settings | Full control over own | Complete privacy |
| topics | Read-only | Public content |
| learning_paths | Read-only | Public content |
| tasks | Read-only | Public content |
| user_progress | Full control over own | Complete isolation |
| practice_sessions | Full control over own | Complete isolation |
| answer_history | View own, insert only | Immutable for integrity |
| spaced_repetition | Full control over own | Complete isolation |

See [docs/ROW_LEVEL_SECURITY.md](./docs/ROW_LEVEL_SECURITY.md) for detailed RLS documentation.

---

## Authentication Setup

### Email/Password Authentication

Already configured! Users can sign up with email/password out of the box.

### OAuth Providers (Optional)

Enable social login (Google, GitHub, etc.):

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable desired provider (e.g., Google)
3. Configure OAuth credentials:
   - Create OAuth app in provider's developer console
   - Copy Client ID and Client Secret
   - Add redirect URL: `https://xxxxx.supabase.co/auth/v1/callback`
4. Save configuration

See [Supabase Auth Docs](https://supabase.com/docs/guides/auth) for provider-specific setup.

---

## Advanced Configuration

### Email Templates

Customize authentication emails:

1. Go to **Authentication** → **Email Templates**
2. Edit templates for:
   - Confirm signup
   - Reset password
   - Magic link
   - Invite user
3. Use variables like `{{ .ConfirmationURL }}` for dynamic content
4. Save changes

### Storage Buckets

Create storage for user avatars and audio files:

1. Go to **Storage** in Supabase dashboard
2. Click **Create a new bucket**
3. Create buckets:
   - `avatars` (public, for user profile pictures)
   - `audio` (public, for task audio files)
4. Set RLS policies for upload permissions

Example RLS policy for avatars:

```sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Real-time Subscriptions

Enable real-time for tables:

1. Go to **Database** → **Replication** in Supabase dashboard
2. Enable replication for tables:
   - `user_progress` (for live progress updates)
   - `practice_sessions` (for session state sync)
3. Use in code:

```typescript
const subscription = supabase
  .channel('user-progress')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'user_progress' },
    (payload) => {
      console.log('Progress updated:', payload);
    }
  )
  .subscribe();
```

---

## Migration Guide

### From Local Development to Production

When deploying to production (Vercel):

1. Create production Supabase project (separate from development)
2. Apply schema to production database
3. Seed production data
4. Configure Vercel environment variables:
   - Go to Vercel project settings
   - Add `VITE_SUPABASE_URL` (production URL)
   - Add `VITE_SUPABASE_ANON_KEY` (production key)
   - Set for Production, Preview, and Development

### Updating Schema

To modify the schema:

#### Option 1: Manual Migration (Development)

1. Make changes in Supabase dashboard SQL editor
2. Export schema:
```bash
supabase db dump -f infrastructure/supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql
```
3. Commit migration file to Git

#### Option 2: Migration Files (Production)

1. Create migration file:
```bash
supabase migration new description_of_change
```

2. Edit migration file in `infrastructure/supabase/migrations/`

3. Apply migration:
```bash
# Development
supabase db push

# Production (via GitHub Actions or manual)
supabase db push --project-ref production-ref
```

---

## Troubleshooting

### Problem: "Invalid API key"

**Cause**: Wrong or missing API credentials

**Solution**:
1. Verify `.env.local` exists and has correct values
2. Copy exact values from Supabase dashboard → Settings → API
3. Restart dev server: `npm run dev`

```bash
# Check environment variables are loaded
console.log(import.meta.env.VITE_SUPABASE_URL);
```

---

### Problem: "Failed to fetch" or CORS errors

**Cause**: Incorrect Supabase URL or network issues

**Solution**:
1. Verify `VITE_SUPABASE_URL` is correct (no trailing slash)
2. Check project is active in Supabase dashboard
3. Verify network connection
4. Check browser console for detailed error

---

### Problem: "new row violates row-level security policy"

**Cause**: RLS policy blocks operation

**Solution**:
1. Verify user is authenticated
2. Check `user_id` matches `auth.uid()`
3. Review RLS policies for table

```javascript
// Check authentication
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user?.id);

// Ensure user_id matches
await supabase.from('user_progress').insert({
  user_id: user.id, // Must match authenticated user
  learning_path_id: 'math-basics'
});
```

See [docs/ROW_LEVEL_SECURITY.md](./docs/ROW_LEVEL_SECURITY.md#troubleshooting-guide) for detailed RLS troubleshooting.

---

### Problem: Empty results when data exists

**Cause**: RLS policy filters out data

**Solution**:
1. Verify you're authenticated
2. Check data has correct `user_id`
3. Query with correct filters

```javascript
// Debug: Check session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Debug: Check data
const { data, error } = await supabase
  .from('user_progress')
  .select('*');
console.log('Data:', data, 'Error:', error);
```

---

### Problem: Database migrations fail

**Cause**: Schema conflicts or syntax errors

**Solution**:
1. Check SQL syntax in migration file
2. Verify no duplicate table/policy names
3. Drop and recreate if needed (development only!)

```sql
-- Development only: Reset schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

### Problem: Slow queries

**Cause**: Missing indexes or inefficient queries

**Solution**:
1. Check query plan in Supabase dashboard
2. Verify indexes exist:

```sql
-- Check indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

3. Add indexes if needed:

```sql
CREATE INDEX idx_table_column ON table_name(column_name);
```

See [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md#performance-considerations) for index recommendations.

---

## Maintenance

### Backup Database

Regular backups are automatic on Supabase. To create manual backup:

```bash
# Using Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d).sql

# Or from dashboard: Settings → Database → Download backup
```

### Monitor Usage

Check usage in Supabase dashboard:
- **Home** → Usage statistics
- **Database** → Database size, connections
- **API** → Request count, latency
- **Auth** → MAU (Monthly Active Users)

### Upgrade Plan

Free tier limits:
- 500 MB database
- 2 GB bandwidth/month
- 50 MB file storage
- 50,000 monthly active users

Upgrade to Pro when approaching limits.

---

## Production Checklist

Before going live:

- [ ] ✅ Create production Supabase project
- [ ] ✅ Apply schema to production database
- [ ] ✅ Configure RLS policies (verified in docs/ROW_LEVEL_SECURITY.md)
- [ ] ✅ Seed initial data (topics, learning paths, tasks)
- [ ] ✅ Set up environment variables in Vercel
- [ ] ✅ Enable email confirmations (Authentication → Settings)
- [ ] ✅ Configure email templates with branding
- [ ] ✅ Set up OAuth providers (optional)
- [ ] ✅ Create storage buckets with RLS policies
- [ ] ✅ Test authentication flow end-to-end
- [ ] ✅ Verify RLS policies with multiple test users
- [ ] ✅ Set up database backups (automatic, verify working)
- [ ] ✅ Configure monitoring and alerts
- [ ] ✅ Document admin access procedures
- [ ] ✅ Review security settings (password policies, session timeout)

---

## Security Best Practices

1. **Never expose service role key** - Only use in backend/admin tools
2. **Use RLS policies** - Never trust client-side authorization alone
3. **Validate input** - Both client-side and database-level validation
4. **Strong passwords** - Enforce minimum length and complexity
5. **HTTPS only** - Supabase enforces this automatically
6. **Regular updates** - Keep Supabase client libraries up to date
7. **Audit logs** - Review auth logs regularly for suspicious activity
8. **Principle of least privilege** - Only grant necessary permissions

---

## Additional Resources

### Documentation
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - Complete schema documentation
- [ROW_LEVEL_SECURITY.md](./docs/ROW_LEVEL_SECURITY.md) - RLS policies and security
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines

### Supabase Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Community
- [Supabase Discord](https://discord.supabase.com/)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

---

## Support

### Getting Help

1. Check this documentation first
2. Review [Troubleshooting](#troubleshooting) section
3. Search [Supabase Discord](https://discord.supabase.com/)
4. Check [GitHub Issues](https://github.com/supabase/supabase/issues)
5. Ask on Stack Overflow with `supabase` tag

### Reporting Issues

If you encounter issues with the MindForge Academy setup:

1. Check existing GitHub issues
2. Create new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)
   - Relevant error messages

---

## Changelog

### 2025-11-24 - Initial Documentation
- Created comprehensive Supabase setup guide
- Documented schema structure and RLS policies
- Added troubleshooting section
- Included production checklist
