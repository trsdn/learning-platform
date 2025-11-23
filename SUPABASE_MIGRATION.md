# Supabase Migration Guide

## Overview

This document tracks the migration from client-side IndexedDB storage to Supabase backend with full user authentication.

**Branch:** `feature/supabase-migration`
**Status:** 🚧 In Progress
**Started:** 2025-01-23

---

## Migration Strategy

### Selected Options
- ✅ **Auth:** Email + Password + Magic Link + Social (Google/GitHub)
- ✅ **Data Storage:** Online-only (no offline cache)
- ✅ **Migration:** Fresh start (no automatic data migration)
- ✅ **Scope:** ALL data in Supabase (content, progress, sessions, settings)

### Architecture Change
```
BEFORE:
Web App → IndexedDB (Dexie) → LocalStorage (Settings)

AFTER:
Web App → Supabase Auth → Supabase PostgreSQL + RLS
```

---

## Progress Tracker

### ✅ Phase 1: Initial Setup (COMPLETED)
- [x] Create `feature/supabase-migration` branch
- [x] Install Supabase dependencies (@supabase/supabase-js, @supabase/auth-ui-react)
- [x] Update `.env.example` with Supabase configuration

### ✅ Phase 2: Database Schema (COMPLETED)
- [x] Create SQL migration: `supabase/migrations/20250123000001_initial_schema.sql`
- [x] Define 9 tables: profiles, user_settings, topics, learning_paths, tasks, user_progress, practice_sessions, answer_history, spaced_repetition
- [x] Configure Row Level Security (RLS) policies for all tables
- [x] Add indexes for performance
- [x] Create updated_at triggers
- [x] Add helper function: `get_user_progress_summary()`

### ✅ Phase 3: Client Configuration (COMPLETED)
- [x] Create Supabase client singleton: `src/modules/storage/supabase-client.ts`
- [x] Create TypeScript types placeholder: `src/modules/storage/database.types.ts`

### 🚧 Phase 4: Authentication (IN PROGRESS)
- [ ] Implement Supabase Auth Service
- [ ] Create Auth Context Provider
- [ ] Build Login/Signup UI
  - [ ] Email/Password form
  - [ ] Magic Link button
  - [ ] Social OAuth buttons (Google, GitHub)
  - [ ] Password reset flow

### 📋 Phase 5: Data Layer (TODO)
- [ ] Implement Supabase repository adapters
  - [ ] TopicRepository
  - [ ] LearningPathRepository
  - [ ] TaskRepository
  - [ ] UserProgressRepository
  - [ ] PracticeSessionRepository
  - [ ] AnswerHistoryRepository
  - [ ] SpacedRepetitionRepository
- [ ] Update repository factory
- [ ] Remove Dexie dependencies

### 📋 Phase 6: Content Seeding (TODO)
- [ ] Create seeding script: `scripts/seed-supabase.ts`
- [ ] Load JSON files from `public/learning-paths/`
- [ ] Upload to Supabase using service role key
- [ ] Make seeding idempotent (upserts)

### 📋 Phase 7: Settings Migration (TODO)
- [ ] Update SettingsService for Supabase
- [ ] Create UserSettingsRepository
- [ ] Remove LocalStorage persistence
- [ ] Add cloud sync functionality

### 📋 Phase 8: UI Updates (TODO)
- [ ] Wrap app with AuthProvider
- [ ] Add protected routes
- [ ] Update Dashboard to use user context
- [ ] Update PracticeSession to save to user's account
- [ ] Create User Profile component
- [ ] Update Admin Panel (optional)

### 📋 Phase 9: Testing (TODO)
- [ ] Integration tests
  - [ ] Auth flows
  - [ ] Repository CRUD
  - [ ] RLS policy enforcement
  - [ ] Session tracking
- [ ] Manual testing
  - [ ] Signup/login flows
  - [ ] Multi-device sync
  - [ ] Data persistence

### 📋 Phase 10: Deployment (TODO)
- [ ] Update CI/CD for Supabase
- [ ] Configure GitHub Secrets
- [ ] Deploy to staging
- [ ] Deploy to production

---

## Setup Instructions

### Prerequisites
1. Create a Supabase project at https://supabase.com
2. Note your project URL and anon key
3. Enable authentication providers:
   - Email/Password
   - Magic Link
   - Google OAuth
   - GitHub OAuth

### Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### Database Setup

1. Run the initial migration in Supabase SQL Editor:
   ```bash
   # Copy contents of supabase/migrations/20250123000001_initial_schema.sql
   # Paste into Supabase SQL Editor and execute
   ```

2. Verify tables were created:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

3. Generate TypeScript types (after schema is applied):
   ```bash
   npx supabase gen types typescript --project-id <your-project-id> > src/modules/storage/database.types.ts
   ```

### OAuth Provider Setup

#### Google OAuth
1. Go to Google Cloud Console
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase Auth settings

#### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase Auth settings

---

## Database Schema Overview

### Tables

| Table | Purpose | RLS | Foreign Keys |
|-------|---------|-----|--------------|
| **profiles** | User profiles (extends auth.users) | ✅ Public read, user update | auth.users.id |
| **user_settings** | User preferences and app settings | ✅ User-only access | profiles.id |
| **topics** | Learning topics (Math, English, etc.) | ✅ Public read | - |
| **learning_paths** | Learning paths within topics | ✅ Public read | topics.id |
| **tasks** | Individual learning tasks | ✅ Public read | learning_paths.id |
| **user_progress** | User progress per learning path | ✅ User-only access | profiles.id, learning_paths.id |
| **practice_sessions** | Practice session tracking | ✅ User-only access | profiles.id, learning_paths.id |
| **answer_history** | Individual answer records | ✅ User-only access | profiles.id, tasks.id, practice_sessions.id |
| **spaced_repetition** | Spaced repetition algorithm data | ✅ User-only access | profiles.id, tasks.id |

### Key Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ├─→ user_settings (1:1)
    ├─→ user_progress (1:many)
    ├─→ practice_sessions (1:many)
    ├─→ answer_history (1:many)
    └─→ spaced_repetition (1:many)

topics (1:many)
    ↓
learning_paths (1:many)
    ↓
tasks (1:many)
```

---

## API Usage Examples

### Authentication

```typescript
import { supabase } from '@/modules/storage/supabase-client';

// Sign up with email/password
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      display_name: 'John Doe'
    }
  }
});

// Sign in with email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Magic link
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://your-app.com/auth/callback',
  },
});

// OAuth (Google)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://your-app.com/auth/callback',
  },
});

// Sign out
const { error } = await supabase.auth.signOut();
```

### Data Queries

```typescript
// Get all topics
const { data: topics, error } = await supabase
  .from('topics')
  .select('*')
  .eq('is_active', true);

// Get learning paths for a topic
const { data: learningPaths, error } = await supabase
  .from('learning_paths')
  .select('*')
  .eq('topic_id', 'mathematik')
  .eq('is_active', true);

// Get user's progress
const { data: progress, error } = await supabase
  .from('user_progress')
  .select('*')
  .eq('user_id', userId);

// Create practice session
const { data: session, error } = await supabase
  .from('practice_sessions')
  .insert({
    user_id: userId,
    learning_path_id: 'algebra-basics',
    task_ids: ['task-1', 'task-2', 'task-3'],
    execution: { status: 'planned' },
    configuration: { targetCount: 10, includeReview: true },
  })
  .select()
  .single();

// Record answer
const { data: answer, error } = await supabase
  .from('answer_history')
  .insert({
    user_id: userId,
    task_id: 'task-1',
    session_id: sessionId,
    is_correct: true,
    time_taken_ms: 5000,
  });
```

---

## Migration Checklist for Developers

When migrating existing code:

- [ ] Replace `db.table.get()` → `supabase.from('table').select().eq('id', id).single()`
- [ ] Replace `db.table.add()` → `supabase.from('table').insert()`
- [ ] Replace `db.table.update()` → `supabase.from('table').update().eq('id', id)`
- [ ] Replace `db.table.delete()` → `supabase.from('table').delete().eq('id', id)`
- [ ] Add user_id to all user-scoped queries
- [ ] Remove Dexie imports
- [ ] Update error handling (Supabase uses different error format)
- [ ] Add loading states for async operations
- [ ] Test RLS policies thoroughly

---

## Known Limitations

1. **No Offline Support:** Requires internet connection (by design choice)
2. **Fresh Start:** No automatic migration from IndexedDB version
3. **Auth Required:** All features require user account
4. **Content Updates:** Require admin access or service role key

---

## Rollback Plan

If migration needs to be rolled back:

1. Switch back to `main` branch
2. Old IndexedDB version continues to work
3. No data loss for existing users (they never migrated)
4. Feature branch can be revisited later

---

## Next Steps

1. **Immediate:** Complete Phase 4 (Authentication implementation)
2. **Short-term:** Implement repository adapters (Phase 5)
3. **Mid-term:** Build seeding scripts and UI updates (Phases 6-8)
4. **Long-term:** Testing and deployment (Phases 9-10)

---

## Questions & Decisions

### Open Questions
- [ ] Admin panel: Keep or remove?
- [ ] Real-time sync: Implement Supabase Realtime?
- [ ] Content versioning: Track changes to learning content?
- [ ] Analytics: Track user behavior beyond answers?

### Resolved Decisions
- ✅ No offline mode (online-only)
- ✅ Fresh start (no migration tool)
- ✅ All data in Supabase (not hybrid)
- ✅ Multiple auth methods (email, magic link, OAuth)

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

---

**Last Updated:** 2025-01-23
**Maintained By:** Development Team
