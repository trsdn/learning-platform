/**
 * Startup helpers that keep the installed PWA usable without a connection.
 */

import type { Topic } from '../types/services';
import { logger } from '@/utils/logger';

export interface TopicSource {
  getAll(): Promise<Topic[]>;
}

/**
 * Loads topics during startup.
 *
 * When the connection check already failed, the read is still attempted
 * because the service worker can serve a cached response. If that read also
 * fails there is simply nothing cached, so an empty list is returned and the
 * caller decides how to inform the user. While connected, a failure is a real
 * error and is propagated unchanged.
 */
export async function loadTopicsOrEmptyWhenOffline(
  repository: TopicSource,
  isDisconnected: boolean
): Promise<Topic[]> {
  try {
    return await repository.getAll();
  } catch (error) {
    if (!isDisconnected) {
      throw error;
    }

    logger.warn('No cached topics available while offline:', error);
    return [];
  }
}
