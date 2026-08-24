/**
 * Pure decision logic for content reconciliation.
 *
 * Seeding upserts whatever the JSON sources currently describe, so anything
 * deleted or renamed would stay active forever unless it is retired
 * afterwards. Retiring is destructive in effect -- a deactivated row stops
 * being served to learners -- so the decision of *whether* to retire, and
 * *what* counts as stale, is kept here as plain functions that can be tested
 * without a database or a live seeding run.
 *
 * `scripts/seed-supabase.ts` executes `main()` on import, which makes anything
 * defined inside it untestable; that is why this logic lives in its own
 * module.
 */

/** The parts of a seeding result that decide whether reconciliation may run. */
export interface ReconciliationInput {
  /** Records the seeding pass failed to write. */
  failed: number;
  /** IDs the seeding pass actually wrote. */
  seededIds: readonly string[];
}

/**
 * Explain why reconciliation must not run, or return `null` when it is safe.
 *
 * Two situations make the true content set unknown, and deactivating on an
 * unknown set silently retires content that is still current:
 *
 *  - a failed upsert, where some rows are missing from `seededIds` even though
 *    they are still part of the catalogue;
 *  - a source read that produced nothing at all. An empty `seededIds` makes
 *    *every* active row look stale, so an unguarded pass would take the whole
 *    catalogue offline. This is not hypothetical: a wrong working directory,
 *    a content directory that was not checked out, or a loader refactor all
 *    produce zero records while reporting zero failures.
 */
export function reconciliationSkipReason(seedResult: ReconciliationInput): string | null {
  if (seedResult.failed > 0) {
    return `${seedResult.failed} record(s) failed to seed`;
  }

  if (seedResult.seededIds.length === 0) {
    return 'the sources produced no records, so every active row would look stale';
  }

  return null;
}

/** Active rows that the current sources no longer produce. */
export function selectStaleIds(
  activeIds: readonly string[],
  seededIds: readonly string[]
): string[] {
  const current = new Set(seededIds);
  return activeIds.filter((id) => !current.has(id));
}

/**
 * Page size for reading currently-active rows.
 *
 * Deliberately below PostgREST's `max_rows` (1000 in
 * `infrastructure/supabase/config.toml`). A page size equal to the server cap
 * is indistinguishable from a truncated response, so a short page could no
 * longer be used to detect the end of the data.
 */
export const RECONCILE_PAGE_SIZE = 500;
