import { loadLearningPathsFromJSON } from './json-loader';

/**
 * All data is loaded from JSON files in public/learning-paths/
 * No sample/fallback data is needed.
 */

/**
 * Seeds the database with learning data from JSON files
 */
export async function seedDatabase(db: any): Promise<void> {
  // Clear existing data
  console.log('🗑️ Clearing existing database...');
  const beforeTopics = await db.topics.count();
  const beforePaths = await db.learningPaths.count();
  const beforeTasks = await db.tasks.count();
  console.log(`Before clear: ${beforeTopics} topics, ${beforePaths} paths, ${beforeTasks} tasks`);

  await db.topics.clear();
  await db.learningPaths.clear();
  await db.tasks.clear();

  const afterClear = await db.tasks.count();
  console.log(`After clear: ${afterClear} tasks remaining`);

  // Load from JSON files
  console.log('📂 Loading learning paths from JSON files...');
  const data = await loadLearningPathsFromJSON();

  if (data.topics.length === 0) {
    throw new Error('No learning paths found in JSON files!');
  }

  console.log(`Saving to database: ${data.topics.length} topics, ${data.learningPaths.length} learning paths, ${data.tasks.length} tasks`);
  console.log('Topics:', data.topics.map(t => t.id));
  console.log('Learning paths:', data.learningPaths.map(lp => `${lp.id} (${lp.taskIds?.length || 0} taskIds)`));
  console.log('Tasks:', data.tasks.map(t => `${t.id} (learningPathId: ${t.learningPathId})`));

  try {
    await db.topics.bulkAdd(data.topics);
    console.log('✓ Topics saved');
  } catch (err: any) {
    console.log('⚠️ Topics exist, using bulkPut to update...');
    await db.topics.bulkPut(data.topics);
    console.log('✓ Topics updated');
  }

  try {
    await db.learningPaths.bulkAdd(data.learningPaths);
    console.log('✓ Learning paths saved');
  } catch (err: any) {
    console.log('⚠️ Learning paths exist, using bulkPut to update...');
    await db.learningPaths.bulkPut(data.learningPaths);
    console.log('✓ Learning paths updated');
  }

  try {
    await db.tasks.bulkAdd(data.tasks);
    console.log('✓ Tasks saved');
  } catch (err: any) {
    console.error('❌ Error saving tasks with bulkAdd:', err.message);
    console.log('⚠️ Some tasks already exist, using bulkPut to update...');
    try {
      await db.tasks.bulkPut(data.tasks);
      console.log('✓ Tasks updated with bulkPut');
    } catch (putErr: any) {
      console.error('❌ Error with bulkPut:', putErr.message);
    }
  }

  console.log(
    `✅ Loaded from JSON: ${data.topics.length} topics, ${data.learningPaths.length} learning paths, ${data.tasks.length} tasks`
  );

  // Verify what was actually saved
  const savedTopics = await db.topics.count();
  const savedPaths = await db.learningPaths.count();
  const savedTasks = await db.tasks.count();
  console.log(`✅ Verified in DB: ${savedTopics} topics, ${savedPaths} learning paths, ${savedTasks} tasks`);
}