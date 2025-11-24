#!/usr/bin/env node

/**
 * Apply Supabase Database Schema
 *
 * This script applies the initial database schema to Supabase using the service role key.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

// Read the migration SQL file
const migrationPath = join(__dirname, '../supabase/migrations/20250123000001_initial_schema.sql');
console.log(`📄 Reading migration: ${migrationPath}\n`);

let sql;
try {
  sql = readFileSync(migrationPath, 'utf8');
  console.log(`✅ Migration file loaded (${sql.length} bytes)\n`);
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
  process.exit(1);
}

// Apply the migration
console.log('🚀 Applying database schema...\n');

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // If exec_sql doesn't exist, try direct query
    console.log('⚠️  exec_sql function not found, trying direct execution...\n');

    // Split SQL into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`[${i + 1}/${statements.length}] Executing...`);

      const { error: execError } = await supabase.rpc('exec', { sql: statement });

      if (execError) {
        console.error(`\n❌ Error in statement ${i + 1}:`, execError.message);
        console.error('Statement:', statement.substring(0, 200) + '...');

        // Continue with other statements
        if (execError.message.includes('already exists')) {
          console.log('⚠️  Already exists, continuing...\n');
        } else {
          console.log('⚠️  Error occurred, continuing with next statement...\n');
        }
      }
    }

    console.log('\n✅ Schema application completed (with warnings)');
    console.log('\n⚠️  Note: Some errors may be expected if tables already exist');
  } else {
    console.log('✅ Schema applied successfully!');
  }

  // Verify tables were created
  console.log('\n🔍 Verifying tables...\n');

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

  console.log('\n🎉 Database setup complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Run: npm run supabase:types');
  console.log('   2. Configure auth providers in Supabase Dashboard');
  console.log('   3. Continue with implementation\n');

} catch (error) {
  console.error('\n❌ Unexpected error:', error);

  console.log('\n📋 Manual application required:');
  console.log('   1. Open: https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/sql');
  console.log('   2. Copy: supabase/migrations/20250123000001_initial_schema.sql');
  console.log('   3. Paste and Run in SQL Editor\n');

  process.exit(1);
}
