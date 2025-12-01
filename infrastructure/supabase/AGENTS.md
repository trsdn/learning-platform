# Supabase Database Agent Guidelines

**Last Updated**: 2025-12-01
**Parent Guide**: [../../AGENTS.md](../../AGENTS.md)
**Status**: 🏆 **Authoritative Source** for database operations and migrations

> **For AI Agents**: This guide contains specific instructions for working with Supabase database operations, migrations, and data management.

**Related Guides**: [scripts/AGENTS.md](../../scripts/AGENTS.md) for seeding scripts, [public/AGENTS.md](../../public/AGENTS.md) for content structure

---

## 🎯 Purpose

This guide provides Supabase-specific guidelines for AI agents working with:
- Database migrations
- Schema management
- Data seeding
- Type generation
- Authentication setup

---

## 📁 Directory Structure

```
supabase/
├── migrations/           # SQL migration files (timestamped)
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240102000000_add_users_table.sql
│   └── ...
├── .temp/               # Temporary files (gitignored)
├── config.toml          # Supabase configuration
└── AGENTS.md           # This file
```

---

## 🗄️ Database Architecture

### Current Schema

**Tables**:
- `topics` - Learning topics (Math, German, etc.)
- `learning_paths` - Collections of tasks
- `tasks` - Individual learning tasks
- `users` - User accounts (Supabase Auth)
- `user_progress` - User performance tracking
- `sessions` - Practice sessions

**Relationships**:
```
topics
  └── learning_paths
       └── tasks
            └── user_progress
                 └── sessions
```

---

## 🔐 Environment Setup

### Required Environment Variables

```bash
# .env.local (development)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# .env.production (production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase CLI Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-id

# Check status
supabase status
```

---

## 🔄 Migration Management

### Creating Migrations

```bash
# Create new migration
supabase migration new descriptive_migration_name

# This creates:
# supabase/migrations/YYYYMMDDHHMMSS_descriptive_migration_name.sql
```

### Migration File Structure

```sql
-- supabase/migrations/20250124000000_add_topics_table.sql

-- Create table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_topics_name ON public.topics(name);

-- Enable RLS
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Topics are viewable by everyone"
    ON public.topics FOR SELECT
    USING (true);

-- Add comments
COMMENT ON TABLE public.topics IS 'Learning topics (Math, German, etc.)';
COMMENT ON COLUMN public.topics.icon IS 'Emoji or icon identifier';
```

### Applying Migrations

```bash
# Apply locally
supabase db reset

# Apply to remote
supabase db push

# Check migration status
supabase migration list
```

### Migration Best Practices

**✅ DO**:
- Use descriptive migration names
- Include rollback statements (if possible)
- Add indexes for foreign keys
- Enable RLS on all tables
- Add comments to tables/columns
- Test migrations locally first
- Use transactions where appropriate

**❌ DON'T**:
- Delete old migrations
- Modify existing migrations (create new ones)
- Commit sensitive data in migrations
- Skip RLS policies
- Use `CASCADE` without consideration

---

## 🔒 Row Level Security (RLS)

### Policy Templates

**Public Read Access**:
```sql
CREATE POLICY "Public read access"
    ON public.table_name FOR SELECT
    USING (true);
```

**Authenticated Users Only**:
```sql
CREATE POLICY "Authenticated users can read"
    ON public.table_name FOR SELECT
    USING (auth.role() = 'authenticated');
```

**User-Specific Data**:
```sql
CREATE POLICY "Users can only see their own data"
    ON public.user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own data"
    ON public.user_progress FOR UPDATE
    USING (auth.uid() = user_id);
```

**Admin-Only Access**:
```sql
CREATE POLICY "Only admins can insert"
    ON public.table_name FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

---

## 🌱 Data Seeding

### Seeding Process

```bash
# Run seed script
npm run seed:supabase

# This executes: scripts/seed-supabase.ts
```

### Seed Script Structure

```typescript
// scripts/seed-supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for admin operations
)

async function seedTopics() {
  const { data, error } = await supabase
    .from('topics')
    .upsert([
      {
        id: 'math-uuid',
        name: 'Mathematik',
        description: 'Mathematik Grundlagen',
        icon: '🔢',
        color: '#4CAF50'
      }
    ])

  if (error) throw error
  return data
}

async function main() {
  console.log('🌱 Seeding database...')

  await seedTopics()
  await seedLearningPaths()
  await seedTasks()

  console.log('✅ Seeding complete!')
}

main().catch(console.error)
```

### Seed Data Best Practices

**✅ DO**:
- Use `upsert` for idempotency
- Use UUIDs for consistent IDs
- Seed in dependency order (topics → paths → tasks)
- Handle errors gracefully
- Log progress
- Use service role key for seeding

**❌ DON'T**:
- Commit service role key to git
- Seed production without backup
- Use random IDs (makes testing hard)
- Seed without cleaning first

---

## 📊 Type Generation

### Generate TypeScript Types

```bash
# Generate types from Supabase schema
npm run supabase:types

# This creates: src/modules/storage/database.types.ts
```

### Using Generated Types

```typescript
import { Database } from '@/modules/storage/database.types'

// Table types
type Topic = Database['public']['Tables']['topics']['Row']
type TopicInsert = Database['public']['Tables']['topics']['Insert']
type TopicUpdate = Database['public']['Tables']['topics']['Update']

// Query with types
const { data, error } = await supabase
  .from('topics')
  .select('*')
  .returns<Topic[]>()
```

---

## 🔧 Schema Management

### Applying Schema Changes

```bash
# Apply schema from local SQL file
npm run supabase:schema

# This executes: scripts/apply-schema.sh
```

### Schema File Structure

**⚠️ Deprecated**: Use migrations instead of direct schema files

```sql
-- Old approach (don't use)
-- supabase/schema.sql

-- New approach (use migrations)
supabase migration new add_new_feature
```

---

## 🚨 Common Operations

### Backup Database

```bash
# Backup schema
supabase db dump > backup-schema-$(date +%Y%m%d).sql

# Backup data
supabase db dump --data-only > backup-data-$(date +%Y%m%d).sql
```

### Reset Database

```bash
# ⚠️ WARNING: Destroys all data!
supabase db reset

# This:
# 1. Drops all tables
# 2. Reapplies all migrations
# 3. Does NOT seed data (run npm run seed:supabase after)
```

### Inspect Database

```bash
# Open Supabase Studio
supabase start
# Visit: http://localhost:54323

# Query database
supabase db psql
```

---

## 🧪 Testing with Supabase

### Test Database Setup

```typescript
// tests/setup/supabase.setup.ts
import { createClient } from '@supabase/supabase-js'

export const testSupabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function cleanDatabase() {
  await testSupabase.from('user_progress').delete().neq('id', '')
  await testSupabase.from('sessions').delete().neq('id', '')
  // ... clean other tables
}
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { testSupabase, cleanDatabase } from '../setup/supabase.setup'

describe('Topics API', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  it('should fetch topics', async () => {
    const { data, error } = await testSupabase
      .from('topics')
      .select('*')

    expect(error).toBeNull()
    expect(data).toBeInstanceOf(Array)
  })
})
```

---

## 🔐 Authentication Guidelines

### User Signup

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      display_name: 'John Doe'
    }
  }
})
```

### User Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
})
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser()
```

---

## 📚 Related Documentation

- **Parent Guide**: [../AGENTS.md](../AGENTS.md)
- **Setup Guide**: [../SETUP_SUPABASE.md](../SETUP_SUPABASE.md)
- **Migration Status**: [../SUPABASE_MIGRATION_STATUS.md](../SUPABASE_MIGRATION_STATUS.md)
- **Deployment**: [../DEPLOYMENT.md](../DEPLOYMENT.md)

---

## 🎯 Agent Commands

```bash
# Generate types
npm run supabase:types

# Apply schema (deprecated - use migrations)
npm run supabase:schema

# Seed database
npm run seed:supabase

# Create migration
supabase migration new feature_name

# Apply migrations
supabase db push

# Reset database (local)
supabase db reset
```

---

## ⚠️ Critical Rules

**DO**:
- ✅ Always use migrations for schema changes
- ✅ Test migrations locally first
- ✅ Enable RLS on all tables
- ✅ Use generated TypeScript types
- ✅ Backup before destructive operations

**DON'T**:
- ❌ Modify existing migrations
- ❌ Commit service role keys
- ❌ Skip RLS policies
- ❌ Use `CASCADE` carelessly
- ❌ Reset production database

---

**Maintained By**: platform-dev-orchestrator, business-analyst
**Questions?**: See [../AGENTS.md](../AGENTS.md) or [Supabase Docs](https://supabase.com/docs)
