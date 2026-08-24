/**
 * Regression tests for content reconciliation decisions.
 *
 * Reconciliation deactivates rows the JSON sources no longer produce. That is
 * destructive in effect, so the guards deciding when it may run matter more
 * than the deactivation itself: a pass that runs on an unknown content set
 * takes the entire catalogue offline for learners.
 *
 * Covers two review findings on #237, both of which let a run with zero
 * reported failures deactivate content that is still current: a seeding run
 * producing zero records (wrong working directory, content directory not
 * checked out, loader refactor), and records that were skipped rather than
 * failed.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  RECONCILE_PAGE_SIZE,
  reconciliationSkipReason,
  selectStaleIds,
} from '../../../scripts/lib/reconciliation';

describe('reconciliationSkipReason', () => {
  it('allows reconciliation when seeding wrote records and nothing failed', () => {
    expect(reconciliationSkipReason({ failed: 0, skipped: 0, seededIds: ['a', 'b'] })).toBeNull();
  });

  it('blocks reconciliation when any record failed to seed', () => {
    const reason = reconciliationSkipReason({ failed: 2, skipped: 0, seededIds: ['a'] });

    expect(reason).toContain('2 record(s) failed to seed');
  });

  it('blocks reconciliation when a record was skipped before reaching the database', () => {
    // `seedTasks` skips tasks whose learningPathId or content is null. Those
    // tasks are still in the JSON sources, so they are not withdrawn content --
    // but they never reach `seededIds`. Without this guard the next step reads
    // their absence as removal and deactivates still-current tasks, while the
    // run reports zero failures.
    const reason = reconciliationSkipReason({ failed: 0, skipped: 3, seededIds: ['a', 'b'] });

    expect(reason).not.toBeNull();
    expect(reason).toContain('3 record(s) were skipped');
  });

  it('blocks reconciliation when the sources produced no records at all', () => {
    // Without this guard the empty set below is treated as "the catalogue is
    // now empty", and every active row is deactivated.
    const reason = reconciliationSkipReason({ failed: 0, skipped: 0, seededIds: [] });

    expect(reason).not.toBeNull();
    expect(reason).toContain('no records');
  });

  it('reports the failure first when a run both failed and produced nothing', () => {
    expect(reconciliationSkipReason({ failed: 1, skipped: 0, seededIds: [] })).toContain(
      'failed to seed'
    );
  });
});

describe('selectStaleIds', () => {
  it('returns only rows the sources no longer produce', () => {
    expect(selectStaleIds(['keep', 'drop'], ['keep'])).toEqual(['drop']);
  });

  it('returns nothing when every active row is still produced', () => {
    expect(selectStaleIds(['a', 'b'], ['b', 'a'])).toEqual([]);
  });

  it('would mark the whole catalogue stale on an empty seed set', () => {
    // Documents exactly why reconciliationSkipReason has to run first: this
    // function is correct, but catastrophic when fed an empty seed set.
    expect(selectStaleIds(['a', 'b', 'c'], [])).toEqual(['a', 'b', 'c']);
  });
});

describe('RECONCILE_PAGE_SIZE', () => {
  it('stays below the PostgREST row cap so a short page still means "last page"', () => {
    const config = readFileSync(
      join(process.cwd(), 'infrastructure', 'supabase', 'config.toml'),
      'utf8'
    );
    const maxRows = Number(/^\s*max_rows\s*=\s*(\d+)/m.exec(config)?.[1]);

    expect(Number.isFinite(maxRows)).toBe(true);
    expect(RECONCILE_PAGE_SIZE).toBeLessThan(maxRows);
  });
});
