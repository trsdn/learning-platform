#!/usr/bin/env node

/**
 * Apply Supabase Database Schema
 *
 * Applies the authoritative migration history from
 * infrastructure/supabase/migrations using the service role key.
 *
 * Prefer scripts/apply-schema.sh (Supabase CLI) when possible; this helper
 * exists for environments without the CLI and requires an `exec_sql` RPC.
 */

import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

console.log('🔧 Supabase Schema Application');
console.log('================================\n');
console.log(`📍 Project: ${supabaseUrl}`);

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read the full migration history in filename order
const migrationsDir = join(__dirname, '../infrastructure/supabase/migrations');
console.log(`📄 Reading migrations from: ${migrationsDir}\n`);

let migrationFiles;
try {
  migrationFiles = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
} catch (error) {
  console.error('❌ Error reading migrations directory:', error.message);
  process.exit(1);
}

if (migrationFiles.length === 0) {
  console.error('❌ No migration files found in', migrationsDir);
  process.exit(1);
}

console.log(`✅ Found ${migrationFiles.length} migration(s):`);
migrationFiles.forEach(file => console.log(`   - ${file}`));
console.log('');

/**
 * Apply a single migration file.
 * Returns true when the migration completed without unexpected errors.
 */
async function applyMigration(fileName) {
  const migrationPath = join(migrationsDir, fileName);
  const sql = readFileSync(migrationPath, 'utf8');

  console.log(`🚀 Applying ${fileName} (${sql.length} bytes)...`);

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (!error) {
    console.log(`✅ ${fileName} applied successfully\n`);
    return true;
  }

  // If exec_sql doesn't exist, fall back to statement-by-statement execution
  console.log('⚠️  exec_sql function not available, trying statement execution...');

  // Naive `;` splitting cannot handle dollar-quoted bodies ($$ ... $$), which
  // would produce broken functions/triggers. Refuse instead of corrupting schema.
  if (sql.includes('$$')) {
    console.error(`❌ ${fileName} contains dollar-quoted bodies ($$) and cannot be applied safely`);
    console.error('   Use the Supabase CLI instead: SUPABASE_ACCESS_TOKEN=<token> ./scripts/apply-schema.sh\n');
    return false;
  }

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Executing ${statements.length} SQL statements...`);

  let failed = 0;
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const { error: execError } = await supabase.rpc('exec', { sql: statement });

    if (execError) {
      if (execError.message.includes('already exists')) {
        console.log(`   [${i + 1}/${statements.length}] ⚠️  Already exists, continuing`);
      } else {
        failed++;
        console.error(`   [${i + 1}/${statements.length}] ❌ ${execError.message}`);
        console.error(`      Statement: ${statement.substring(0, 160)}...`);
      }
    }
  }

  if (failed > 0) {
    console.error(`❌ ${fileName}: ${failed} statement(s) failed\n`);
    return false;
  }

  console.log(`✅ ${fileName} applied (with warnings)\n`);
  return true;
}

try {
  let failedMigrations = 0;

  for (const fileName of migrationFiles) {
    const succeeded = await applyMigration(fileName);
    if (!succeeded) {
      failedMigrations++;
    }
  }

  // Verify tables were created
  console.log('🔍 Verifying tables...\n');

  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');

  if (tablesError) {
    console.error('❌ Error checking tables:', tablesError.message);
  } else {
    console.log(`✅ Found ${tables?.length || 0} tables in public schema:`);
    tables?.forEach(t => console.log(`   - ${t.table_name}`));
  }

  if (failedMigrations > 0) {
    console.error(`\n❌ ${failedMigrations} migration(s) failed. Review the errors above.`);
    process.exit(1);
  }

  console.log('\n🎉 Database setup complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Run: npm run supabase:types');
  console.log('   2. Configure auth providers in Supabase Dashboard');
  console.log('   3. Continue with implementation\n');

} catch (error) {
  console.error('\n❌ Unexpected error:', error);

  console.log('\n📋 Manual application required:');
  console.log('   1. Open your project SQL editor');
  console.log(`   2. Run each migration in ${migrationsDir} in filename order\n`);

  process.exit(1);
}
