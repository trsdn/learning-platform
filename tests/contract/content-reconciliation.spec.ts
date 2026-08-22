/**
 * Contract tests for content reconciliation.
 *
 * Content synchronisation only upserted the rows present in the current JSON
 * sources, so paths and tasks that were deleted or renamed stayed active and
 * kept being served. Retiring content has to be a soft operation because
 * `user_progress`, `answer_history` and `spaced_repetition` all reference it.
 *
 * These tests pin both halves of the fix:
 *  - the SQL sources give `tasks` an `is_active` flag
 *  - the repositories exclude inactive content from practice selection while
 *    keeping it resolvable by ID so learner history still renders
 *
 * Covers the fix for #230.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('@/modules/storage/supabase-client', () => ({
  supabase: { from: vi.fn() },
  getCurrentUserId: vi.fn(() => 'test-user-id'),
}));

vi.mock('@/modules/core/utils/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { TaskRepository } from '@/modules/storage/adapters/supabase-repositories';
import { supabase } from '@/modules/storage/supabase-client';

const supabaseDir = join(process.cwd(), 'infrastructure', 'supabase');
const schemaSql = readFileSync(join(supabaseDir, 'schema.sql'), 'utf8').replace(/--[^\n]*/g, '');

const migrationsDir = join(supabaseDir, 'migrations');
const migrationSql = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()
  .map((file) => readFileSync(join(migrationsDir, file), 'utf8').replace(/--[^\n]*/g, ''))
  .join('\n');

/**
 * Minimal PostgREST builder stub. Every filter is both chainable and awaitable,
 * which is what supabase-js does, so a query can end on any of them.
 */
function createQueryMock(resolveWith: unknown) {
  const calls: Array<[string, unknown[]]> = [];
  const chain: Record<string, unknown> = {};

  const record = (name: string) =>
    vi.fn((...args: unknown[]) => {
      calls.push([name, args]);
      return Object.assign(Promise.resolve(resolveWith), chain);
    });

  for (const method of ['select', 'eq', 'in', 'not', 'order', 'limit', 'range', 'contains']) {
    chain[method] = record(method);
  }
  chain.single = vi.fn(() => Promise.resolve(resolveWith));

  return { chain, calls };
}

const activeTaskRow = {
  id: 'task-1',
  learning_path_id: 'path-1',
  template_id: null,
  type: 'multiple-choice',
  content: {},
  metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
  has_audio: false,
  audio_url: null,
  language: null,
  ipa: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

describe('tasks schema supports deactivation', () => {
  it('declares is_active on the tasks table', () => {
    const tasksTable = schemaSql.match(/CREATE TABLE tasks\s*\(([\s\S]*?)\n\);/);

    expect(tasksTable).not.toBeNull();
    expect(tasksTable?.[1]).toMatch(/is_active\s+BOOLEAN/i);
  });

  it('ships a migration that adds the flag to existing databases', () => {
    expect(migrationSql).toMatch(/ALTER TABLE tasks[\s\S]*?ADD COLUMN[\s\S]*?is_active/i);
  });

  it('indexes the flag so practice selection stays cheap', () => {
    expect(schemaSql).toMatch(/CREATE INDEX[^;]*ON tasks\(is_active\)/i);
  });
});

describe('TaskRepository excludes deactivated content', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new TaskRepository();
    vi.clearAllMocks();
  });

  const filteringQueries: Array<[string, (repo: TaskRepository) => Promise<unknown>]> = [
    ['getAll', (repo) => repo.getAll()],
    ['getByLearningPathId', (repo) => repo.getByLearningPathId('path-1')],
    ['getByLearningPathIds', (repo) => repo.getByLearningPathIds(['path-1'])],
    ['getRandomTasks', (repo) => repo.getRandomTasks(1)],
    ['getByType', (repo) => repo.getByType('multiple-choice')],
    ['getByDifficulty', (repo) => repo.getByDifficulty('easy')],
    ['search', (repo) => repo.search({ learningPathId: 'path-1' })],
  ];

  it.each(filteringQueries)('%s only returns active tasks', async (_name, run) => {
    const { chain, calls } = createQueryMock({ data: [activeTaskRow], error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await run(repository);

    expect(calls).toContainEqual(['eq', ['is_active', true]]);
  });

  it('counts only active tasks', async () => {
    const { chain, calls } = createQueryMock({ count: 1, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await repository.count();

    expect(calls).toContainEqual(['eq', ['is_active', true]]);
  });

  it('still resolves a deactivated task by ID so learner history renders', async () => {
    const { chain, calls } = createQueryMock({
      data: { ...activeTaskRow, is_active: false },
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    const task = await repository.getById('task-1');

    expect(task?.id).toBe('task-1');
    expect(calls).not.toContainEqual(['eq', ['is_active', true]]);
  });

  it('still resolves deactivated tasks in bulk so answer history renders', async () => {
    const { chain, calls } = createQueryMock({
      data: [{ ...activeTaskRow, is_active: false }],
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    const tasks = await repository.getByIds(['task-1']);

    expect(tasks).toHaveLength(1);
    expect(calls).not.toContainEqual(['eq', ['is_active', true]]);
  });
});
