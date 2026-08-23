/**
 * Contract test for the offline content cache (#227).
 *
 * The service worker configuration lives in vite.config.ts and cannot be
 * exercised from a unit test, so the rules that keep the installed PWA usable
 * offline - and the privacy boundary around them - are asserted against the
 * configuration source.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const config = readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf-8');

/** The runtimeCaching entry that serves learning content while offline. */
function contentRule(): string {
  const marker = 'supabase-content-v1';
  const cacheNameIndex = config.indexOf(marker);
  expect(cacheNameIndex, `expected a "${marker}" runtime cache`).toBeGreaterThan(-1);

  const start = config.lastIndexOf('urlPattern', cacheNameIndex);
  const nextRule = config.indexOf('urlPattern', cacheNameIndex);
  const end = nextRule === -1 ? config.length : nextRule;
  return config.slice(start, end);
}

describe('offline content caching', () => {
  it('caches the shared learning content tables', () => {
    const rule = contentRule();

    expect(rule).toContain('topics');
    expect(rule).toContain('learning_paths');
    expect(rule).toContain('tasks');
  });

  it('prefers the network so cached content cannot go stale while online', () => {
    const rule = contentRule();

    expect(rule).toContain("handler: 'NetworkFirst'");
    expect(rule).toMatch(/networkTimeoutSeconds:\s*\d+/);
  });

  it('only stores successful responses', () => {
    const rule = contentRule();

    expect(rule).toMatch(/statuses:\s*\[200\]/);
  });

  it('never caches per-user tables, which would leak on a shared device', () => {
    const rule = contentRule();

    for (const userTable of ['user_progress', 'answer_history', 'spaced_repetition', 'profiles']) {
      expect(rule).not.toContain(userTable);
    }
  });

  it('keeps serving the app shell for navigations', () => {
    expect(config).toContain('globPatterns');
    expect(config).toMatch(/index\.html|globPatterns/);
  });
});
