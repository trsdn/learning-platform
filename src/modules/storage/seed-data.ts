import { loadLearningPathsFromJSON } from './json-loader';
import { logger } from '@/utils/logger';

/**
 * All data is loaded from JSON files in public/learning-paths/
 * No sample/fallback data is needed.
 */

/**
 * Seeds the database with learning data from JSON files
 */
export async function seedDatabase(db: {
  topics: { count: () => Promise<number>; clear: () => Promise<void>; bulkAdd: (items: unknown[]) => Promise<void>; bulkPut: (items: unknown[]) => Promise<void> };
  learningPaths: { count: () => Promise<number>; clear: () => Promise<void>; bulkAdd: (items: unknown[]) => Promise<void>; bulkPut: (items: unknown[]) => Promise<void> };
  tasks: { count: () => Promise<number>; clear: () => Promise<void>; bulkAdd: (items: unknown[]) => Promise<void>; bulkPut: (items: unknown[]) => Promise<void> };
}): Promise<void> {
  // Clear existing data
  logger.debug('Clearing existing database...');
  const beforeTopics = await db.topics.count();
  const beforePaths = await db.learningPaths.count();
  const beforeTasks = await db.tasks.count();
  logger.debug(`Before clear: ${beforeTopics} topics, ${beforePaths} paths, ${beforeTasks} tasks`);

  await db.topics.clear();
  await db.learningPaths.clear();
  await db.tasks.clear();

  const afterClear = await db.tasks.count();
  logger.debug(`After clear: ${afterClear} tasks remaining`);

  // Load from JSON files
  logger.debug('Loading learning paths from JSON files...');
  const data = await loadLearningPathsFromJSON();

  if (data.topics.length === 0) {
    throw new Error('No learning paths found in JSON files!');
  }

  logger.debug(`Saving to database: ${data.topics.length} topics, ${data.learningPaths.length} learning paths, ${data.tasks.length} tasks`);
  logger.debug('Topics:', data.topics.map(t => t.id));
  logger.debug('Learning paths:', data.learningPaths.map(lp => `${lp.id} (${lp.taskIds?.length || 0} taskIds)`));
  logger.debug('Tasks:', data.tasks.map(t => `${t.id} (learningPathId: ${t.learningPathId})`));

  try {
    await db.topics.bulkAdd(data.topics);
    logger.debug('Topics saved');
  } catch (err: unknown) {
    logger.debug('Topics exist, using bulkPut to update...');
    await db.topics.bulkPut(data.topics);
    logger.debug('Topics updated');
  }

  try {
    await db.learningPaths.bulkAdd(data.learningPaths);
    logger.debug('Learning paths saved');
  } catch (err: unknown) {
    logger.debug('Learning paths exist, using bulkPut to update...');
    await db.learningPaths.bulkPut(data.learningPaths);
    logger.debug('Learning paths updated');
  }

  try {
    await db.tasks.bulkAdd(data.tasks);
    logger.debug('Tasks saved');
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error('Error saving tasks with bulkAdd:', errorMessage);
    logger.debug('Some tasks already exist, using bulkPut to update...');
    try {
      await db.tasks.bulkPut(data.tasks);
      logger.debug('Tasks updated with bulkPut');
    } catch (putErr: unknown) {
      const putErrorMessage = putErr instanceof Error ? putErr.message : String(putErr);
      logger.error('Error with bulkPut:', putErrorMessage);
    }
  }

  logger.debug(
    `Loaded from JSON: ${data.topics.length} topics, ${data.learningPaths.length} learning paths, ${data.tasks.length} tasks`
  );

  // Verify what was actually saved
  const savedTopics = await db.topics.count();
  const savedPaths = await db.learningPaths.count();
  const savedTasks = await db.tasks.count();
  logger.debug(`Verified in DB: ${savedTopics} topics, ${savedPaths} learning paths, ${savedTasks} tasks`);
}