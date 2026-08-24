/**
 * Unit tests for the offline startup helpers.
 *
 * Regression cover for #227: an installed PWA must be able to start from
 * cached content instead of dead-ending on a connection error screen.
 */

import { describe, it, expect, vi } from 'vitest';
import { loadTopicsOrEmptyWhenOffline } from '../../../../src/modules/core/utils/offline-boot';
import type { Topic } from '../../../../src/modules/core/types/services';

vi.mock('@/utils/logger', () => ({
  logger: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const topic = { id: 'math', name: 'Mathematik' } as unknown as Topic;

describe('loadTopicsOrEmptyWhenOffline', () => {
  it('returns the topics the repository provides while connected', async () => {
    const repository = { getAll: vi.fn().mockResolvedValue([topic]) };

    await expect(loadTopicsOrEmptyWhenOffline(repository, false)).resolves.toEqual([topic]);
  });

  it('still asks the repository while disconnected so a cached response can be used', async () => {
    const repository = { getAll: vi.fn().mockResolvedValue([topic]) };

    const result = await loadTopicsOrEmptyWhenOffline(repository, true);

    expect(repository.getAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([topic]);
  });

  it('reports no topics instead of throwing when disconnected and nothing is cached', async () => {
    const repository = { getAll: vi.fn().mockRejectedValue(new Error('Failed to fetch')) };

    await expect(loadTopicsOrEmptyWhenOffline(repository, true)).resolves.toEqual([]);
  });

  it('propagates the failure when the connection is healthy', async () => {
    const failure = new Error('permission denied');
    const repository = { getAll: vi.fn().mockRejectedValue(failure) };

    await expect(loadTopicsOrEmptyWhenOffline(repository, false)).rejects.toThrow('permission denied');
  });
});
