import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Contract tests for database security invariants.
 *
 * The platform has no automated integration test against a live Postgres
 * instance, so these tests guard the SQL sources instead: they assert that the
 * committed schema snapshot and migration history keep row level security and
 * SECURITY DEFINER functions locked down.
 *
 * Covers the fixes for:
 *  - #233 profiles were readable by everyone, exposing user email addresses
 *  - #234 get_user_progress_summary() returned any user's progress
 */

const supabaseDir = join(process.cwd(), 'infrastructure', 'supabase');
const schemaSql = stripComments(readFileSync(join(supabaseDir, 'schema.sql'), 'utf8'));

const migrationsDir = join(supabaseDir, 'migrations');
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort();
const migrationSql = migrationFiles
  .map((file) => stripComments(readFileSync(join(migrationsDir, file), 'utf8')))
  .join('\n');

/** Removes `--` line comments so assertions only look at executable SQL. */
function stripComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, '');
}

/** Splits a SQL source into statements, ignoring semicolons inside $$ bodies. */
function splitStatements(sql: string): string[] {
  return sql
    .split(/\$\$/)
    .map((chunk, index) => (index % 2 === 0 ? chunk.split(';') : [chunk]))
    .flat()
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

describe('profiles row level security', () => {
  it('does not expose profiles to every caller', () => {
    const publicSelectPolicies = splitStatements(schemaSql).filter(
      (statement) =>
        /CREATE POLICY/i.test(statement) &&
        /ON\s+profiles/i.test(statement) &&
        /FOR\s+SELECT/i.test(statement) &&
        /USING\s*\(\s*true\s*\)/i.test(statement)
    );

    expect(publicSelectPolicies).toEqual([]);
  });

  it('restricts profile reads to the owning user', () => {
    const selectPolicies = splitStatements(schemaSql).filter(
      (statement) =>
        /CREATE POLICY/i.test(statement) &&
        /ON\s+profiles/i.test(statement) &&
        /FOR\s+SELECT/i.test(statement)
    );

    expect(selectPolicies).toHaveLength(1);
    expect(selectPolicies[0]).toMatch(/USING\s*\(\s*auth\.uid\(\)\s*=\s*id\s*\)/i);
  });

  it('drops the permissive policy in the migration history', () => {
    expect(migrationSql).toMatch(
      /DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles/i
    );
  });
});

describe('get_user_progress_summary', () => {
  const definition = schemaSql.slice(
    schemaSql.indexOf('CREATE OR REPLACE FUNCTION get_user_progress_summary')
  );

  it('is defined in the schema snapshot', () => {
    expect(schemaSql).toContain('CREATE OR REPLACE FUNCTION get_user_progress_summary');
  });

  it('rejects callers asking for another user', () => {
    expect(definition).toMatch(/p_user_id IS DISTINCT FROM auth\.uid\(\)/i);
    expect(definition).toMatch(/auth\.uid\(\) IS NULL/i);
    expect(definition).toMatch(/RAISE EXCEPTION/i);
  });

  it('is not executable by anonymous callers', () => {
    expect(schemaSql).toMatch(
      /REVOKE ALL ON FUNCTION get_user_progress_summary\(UUID\) FROM PUBLIC/i
    );
    expect(schemaSql).toMatch(
      /REVOKE ALL ON FUNCTION get_user_progress_summary\(UUID\) FROM anon/i
    );
    expect(schemaSql).toMatch(
      /GRANT EXECUTE ON FUNCTION get_user_progress_summary\(UUID\) TO authenticated/i
    );
  });
});

describe('SECURITY DEFINER functions', () => {
  it('pin a non-mutable search_path', () => {
    const definerStatements = splitStatements(schemaSql).filter((statement) =>
      /SECURITY DEFINER/i.test(statement)
    );

    expect(definerStatements.length).toBeGreaterThan(0);

    for (const statement of definerStatements) {
      expect(statement).toMatch(/SET\s+search_path\s*=/i);
    }
  });
});
