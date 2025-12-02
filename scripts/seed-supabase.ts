/**
 * Supabase Seeding Script
 *
 * Seeds the Supabase database with learning content from JSON files.
 * This script should be run after the database schema has been applied.
 *
 * Usage:
 *   npm run seed:supabase
 *
 * Prerequisites:
 *   - Supabase project created
 *   - Schema applied (see supabase/migrations/)
 *   - Environment variables set in .env.local
 */

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Database } from '../src/modules/storage/database.types';
import type { Topic, LearningPath, Task } from '../src/modules/core/types/services';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '../.env.local') });

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  console.error('\n💡 Make sure .env.local file exists with these variables.');
  process.exit(1);
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Topic configuration
 */
const topicConfig: Record<string, Partial<Topic>> = {
  test: {
    id: 'test',
    title: 'Test & Demo',
    description: 'Demonstriert alle Aufgabentypen der Plattform',
    metadata: {
      estimatedHours: 1,
      difficultyLevel: 'beginner',
      prerequisites: [],
    },
  },
  mathematik: {
    id: 'mathematik',
    title: 'Mathematik',
    description: 'Grundlagen der Mathematik: Algebra, Geometrie und mehr',
    metadata: {
      estimatedHours: 40,
      difficultyLevel: 'intermediate',
      prerequisites: [],
    },
  },
  biologie: {
    id: 'biologie',
    title: 'Biologie',
    description: 'Einführung in die Biologie: Zellen, Genetik und Ökosysteme',
    metadata: {
      estimatedHours: 35,
      difficultyLevel: 'beginner',
      prerequisites: [],
    },
  },
  spanisch: {
    id: 'spanisch',
    title: 'Spanisch',
    description: 'Lerne Spanisch: Vokabeln, Grammatik und Konversation',
    metadata: {
      estimatedHours: 50,
      difficultyLevel: 'beginner',
      prerequisites: [],
    },
  },
  englisch: {
    id: 'englisch',
    title: 'Englisch',
    description: 'Lerne Englisch: Unregelmäßige Verben und mehr',
    metadata: {
      estimatedHours: 1,
      difficultyLevel: 'beginner',
      prerequisites: [],
    },
  },
};

/**
 * Load learning paths from JSON files (Node.js filesystem version)
 */
function loadLearningPathsFromFiles(): {
  topics: Topic[];
  learningPaths: LearningPath[];
  tasks: Task[];
} {
  const topics: Map<string, Topic> = new Map();
  const learningPaths: LearningPath[] = [];
  const tasks: Task[] = [];

  const learningPathsDir = join(__dirname, '../public/learning-paths');

  // Read all topic directories
  const topicDirs = readdirSync(learningPathsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  console.log(`📂 Found topic directories: ${topicDirs.join(', ')}`);

  for (const topicId of topicDirs) {
    const topicDir = join(learningPathsDir, topicId);

    // Create topic if it doesn't exist
    if (!topics.has(topicId)) {
      const config = topicConfig[topicId] || {
        id: topicId,
        title: topicId.charAt(0).toUpperCase() + topicId.slice(1),
        description: `Lernmaterialien für ${topicId}`,
        metadata: {
          estimatedHours: 30,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      };

      const topic: Topic = {
        id: config.id!,
        title: config.title!,
        description: config.description!,
        learningPathIds: [],
        isActive: true,
        metadata: config.metadata!,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      topics.set(topicId, topic);
    }

    // Read all JSON files in this topic directory
    const files = readdirSync(topicDir).filter((file) => file.endsWith('.json'));

    for (const filename of files) {
      try {
        const filePath = join(topicDir, filename);
        const fileContent = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        // Build task IDs array from tasks
        const taskIds = data.tasks.map((task: any) => task.id);

        // Add learning path with task IDs
        const learningPath: LearningPath = {
          ...data.learningPath,
          taskIds,
          createdAt: data.learningPath.createdAt
            ? new Date(data.learningPath.createdAt)
            : new Date('2024-01-01'),
          updatedAt: data.learningPath.createdAt
            ? new Date(data.learningPath.createdAt)
            : new Date('2024-01-01'),
        };
        learningPaths.push(learningPath);

        // Add learning path ID to topic
        const topic = topics.get(topicId)!;
        if (!topic.learningPathIds.includes(learningPath.id)) {
          topic.learningPathIds.push(learningPath.id);
        }

        // Add tasks with learning path ID
        for (const taskData of data.tasks) {
          // Handle old format where content fields are directly in task
          let content = (taskData as any).content;

          if (!content) {
            // Old format: convert based on task type
            const type = taskData.type;

            if (type === 'flashcard' && (taskData as any).front) {
              content = {
                front: (taskData as any).front,
                back: (taskData as any).back,
                explanation: (taskData as any).explanation,
              };
            } else if (type === 'text-input' && (taskData as any).question) {
              content = {
                question: (taskData as any).question,
                correctAnswer: (taskData as any).correctAnswer,
                alternatives: (taskData as any).alternatives || [],
                explanation: (taskData as any).explanation,
              };
            } else if (type === 'multiple-choice' && (taskData as any).question) {
              content = {
                question: (taskData as any).question,
                options: (taskData as any).options || [],
                correctAnswer: (taskData as any).correctAnswer,
                explanation: (taskData as any).explanation,
              };
            } else if (type === 'true-false' && (taskData as any).question) {
              content = {
                question: (taskData as any).question,
                correctAnswer: (taskData as any).correctAnswer,
                explanation: (taskData as any).explanation,
              };
            } else if (type === 'matching' && (taskData as any).pairs) {
              content = {
                pairs: (taskData as any).pairs,
                explanation: (taskData as any).explanation,
              };
            } else {
              // If we can't convert, use the task data as content
              content = taskData as any;
            }
          }

          // Build metadata from old format if needed
          const metadata = (taskData as any).metadata || {
            difficulty: (taskData as any).difficulty || 'medium',
            tags: (taskData as any).tags || [],
            estimatedTime: 60,
            points: 10,
          };

          const task: Task = {
            id: (taskData as any).id,
            learningPathId: learningPath.id, // Add learningPathId from parent learning path
            templateId: (taskData as any).templateId || '',
            type: taskData.type as any,
            content: content,
            metadata: metadata,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          };
          tasks.push(task);
        }

        console.log(`  ✓ Loaded ${topicId}/${filename}: ${data.tasks.length} tasks`);
      } catch (error) {
        console.error(`  ❌ Failed to load ${topicId}/${filename}:`, error);
      }
    }
  }

  return {
    topics: Array.from(topics.values()),
    learningPaths,
    tasks,
  };
}

/**
 * Seed topics into Supabase
 */
async function seedTopics(
  data: ReturnType<typeof loadLearningPathsFromFiles>
) {
  console.log(`\n📚 Seeding ${data.topics.length} topics...`);

  for (const topic of data.topics) {
    const { error } = await supabase.from('topics').upsert(
      {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        learning_path_ids: topic.learningPathIds,
        is_active: topic.isActive,
        metadata: topic.metadata as any,
        created_at: topic.createdAt.toISOString(),
        updated_at: topic.updatedAt.toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error(`  ❌ Failed to seed topic ${topic.id}:`, error.message);
    } else {
      console.log(`  ✓ ${topic.title}`);
    }
  }

  console.log(`✅ Topics seeded: ${data.topics.length}`);
}

/**
 * Seed learning paths into Supabase
 */
async function seedLearningPaths(
  data: ReturnType<typeof loadLearningPathsFromFiles>
) {
  console.log(`\n📖 Seeding ${data.learningPaths.length} learning paths...`);

  for (const learningPath of data.learningPaths) {
    // Extract fields from metadata that should be top-level in DB
    let difficulty = (learningPath as any).difficulty || 'medium';

    // Map difficulty values to match DB constraint (easy, medium, hard)
    const difficultyMap: Record<string, string> = {
      beginner: 'easy',
      easy: 'easy',
      intermediate: 'medium',
      medium: 'medium',
      advanced: 'hard',
      hard: 'hard',
    };
    difficulty = difficultyMap[difficulty.toLowerCase()] || 'medium';

    const estimatedTime = (learningPath as any).estimatedTime || 30;
    const requirements = (learningPath as any).requirements || {
      minimumAccuracy: 70,
      requiredTasks: 10,
    };

    const { error } = await supabase.from('learning_paths').upsert(
      {
        id: learningPath.id,
        topic_id: learningPath.topicId,
        title: learningPath.title,
        description: learningPath.description,
        difficulty: difficulty,
        estimated_time: estimatedTime,
        requirements: requirements as any,
        task_ids: learningPath.taskIds,
        is_active: learningPath.metadata?.isActive ?? true,
        created_at: learningPath.createdAt.toISOString(),
        updated_at: learningPath.updatedAt.toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error(
        `  ❌ Failed to seed learning path ${learningPath.id}:`,
        error.message
      );
    } else {
      console.log(
        `  ✓ ${learningPath.title} (${learningPath.taskIds.length} tasks)`
      );
    }
  }

  console.log(`✅ Learning paths seeded: ${data.learningPaths.length}`);
}

/**
 * Seed tasks into Supabase
 */
async function seedTasks(
  data: ReturnType<typeof loadLearningPathsFromFiles>
) {
  console.log(`\n📝 Seeding ${data.tasks.length} tasks...`);

  // Batch insert tasks (Supabase has a limit, so we'll do it in chunks)
  const BATCH_SIZE = 100;
  let seeded = 0;

  for (let i = 0; i < data.tasks.length; i += BATCH_SIZE) {
    const batch = data.tasks.slice(i, i + BATCH_SIZE);

    // Filter out tasks with null learning_path_id or null content
    const validTasks = batch.filter(task => task.learningPathId && task.content);
    const invalidTasks = batch.filter(task => !task.learningPathId || !task.content);

    if (invalidTasks.length > 0) {
      const nullPathTasks = invalidTasks.filter(t => !t.learningPathId);
      const nullContentTasks = invalidTasks.filter(t => !t.content);

      if (nullPathTasks.length > 0) {
        console.warn(`  ⚠️  Skipping ${nullPathTasks.length} tasks with null learningPathId:`,
          nullPathTasks.slice(0, 5).map(t => t.id).join(', '), '...');
      }
      if (nullContentTasks.length > 0) {
        console.warn(`  ⚠️  Skipping ${nullContentTasks.length} tasks with null content:`,
          nullContentTasks.slice(0, 5).map(t => t.id).join(', '), '...');
      }
    }

    if (validTasks.length === 0) {
      console.log(`  ⚠️  Batch ${Math.floor(i / BATCH_SIZE) + 1}: No valid tasks to insert`);
      continue;
    }

    const { error } = await supabase.from('tasks').upsert(
      validTasks.map((task) => {
        // Extract audio fields if they exist
        const hasAudio = !!(task.metadata as any)?.audioUrl;
        const audioUrl = (task.metadata as any)?.audioUrl || null;
        const language = (task.metadata as any)?.language || null;
        const ipa = (task.metadata as any)?.ipa || null;

        return {
          id: task.id,
          learning_path_id: task.learningPathId,
          template_id: (task as any).templateId || null,
          type: task.type,
          content: task.content as any,
          metadata: task.metadata as any,
          has_audio: hasAudio,
          audio_url: audioUrl,
          language: language,
          ipa: ipa,
          created_at: task.createdAt.toISOString(),
          updated_at: task.updatedAt.toISOString(),
        };
      }),
      { onConflict: 'id' }
    );

    if (error) {
      console.error(
        `  ❌ Failed to seed task batch ${i}-${i + validTasks.length}:`,
        error.message
      );
    } else {
      seeded += validTasks.length;
      console.log(
        `  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${validTasks.length} tasks`
      );
    }
  }

  console.log(`✅ Tasks seeded: ${seeded}/${data.tasks.length}`);
}

// Explicit allowlist of ALLOWED development project references
// Only these projects can be seeded automatically
const ALLOWED_DEV_PROJECT_REFS = [
  'ngasmbisrysigagtqpzj', // mindforge-academy-dev
];

// Production project reference - NEVER seed automatically
const PRODUCTION_PROJECT_REF = 'knzjdckrtewoigosaxoh';

/**
 * Validate Supabase URL format
 */
function validateSupabaseUrl(url: string | undefined): void {
  if (!url) {
    console.error('\n❌ SUPABASE URL VALIDATION FAILED!');
    console.error('');
    console.error('VITE_SUPABASE_URL is not set or is empty.');
    console.error('Please set the environment variable to a valid Supabase URL.');
    console.error('');
    console.error('Example: VITE_SUPABASE_URL=https://yourproject.supabase.co');
    process.exit(1);
  }

  if (!url.startsWith('https://')) {
    console.error('\n❌ SUPABASE URL VALIDATION FAILED!');
    console.error('');
    console.error('URL must start with https://');
    console.error('Provided URL:', url);
    process.exit(1);
  }

  if (!url.includes('.supabase.co')) {
    console.error('\n❌ SUPABASE URL VALIDATION FAILED!');
    console.error('');
    console.error('URL does not appear to be a valid Supabase URL.');
    console.error('Expected format: https://<project-ref>.supabase.co');
    console.error('Provided URL:', url);
    process.exit(1);
  }
}

/**
 * Extract project ref from Supabase URL
 */
function extractProjectRef(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

/**
 * Check if we're targeting an allowed development environment
 */
function checkProductionSafety(): void {
  // First, validate the URL format
  validateSupabaseUrl(supabaseUrl);

  const projectRef = extractProjectRef(supabaseUrl);
  const isAllowedDev = projectRef && ALLOWED_DEV_PROJECT_REFS.includes(projectRef);
  const isProduction = projectRef === PRODUCTION_PROJECT_REF;
  const forceProduction = process.env.FORCE_PRODUCTION_SEED === 'true';
  const confirmProduction = process.env.CONFIRM_PRODUCTION_SEED === 'I_UNDERSTAND_THIS_IS_DANGEROUS';

  // Block unknown/unrecognized projects
  if (!isAllowedDev && !isProduction) {
    console.error('\n❌ UNKNOWN PROJECT BLOCKED!');
    console.error('');
    console.error('The target Supabase project is not in the allowed list.');
    console.error('');
    console.error('Project ref:', projectRef);
    console.error('URL:', supabaseUrl);
    console.error('');
    console.error('Allowed dev projects:', ALLOWED_DEV_PROJECT_REFS.join(', '));
    console.error('');
    console.error('If this is a new dev project, add it to ALLOWED_DEV_PROJECT_REFS');
    console.error('in scripts/seed-supabase.ts');
    process.exit(1);
  }

  // Block production without double-confirmation
  if (isProduction && !forceProduction) {
    console.error('\n❌ PRODUCTION SEEDING BLOCKED!');
    console.error('');
    console.error('You are attempting to seed the PRODUCTION database.');
    console.error('This is dangerous and not allowed by default.');
    console.error('');
    console.error('Production URL detected:', supabaseUrl);
    console.error('');
    console.error('If you REALLY need to seed production (NOT recommended):');
    console.error('  FORCE_PRODUCTION_SEED=true \\');
    console.error('  CONFIRM_PRODUCTION_SEED=I_UNDERSTAND_THIS_IS_DANGEROUS \\');
    console.error('  npm run seed:supabase');
    console.error('');
    console.error('⚠️  This action cannot be easily undone!');
    process.exit(1);
  }

  // Require double confirmation for production
  if (isProduction && forceProduction && !confirmProduction) {
    console.error('\n❌ PRODUCTION CONFIRMATION REQUIRED!');
    console.error('');
    console.error('You set FORCE_PRODUCTION_SEED=true but did not confirm.');
    console.error('');
    console.error('To proceed, also set:');
    console.error('  CONFIRM_PRODUCTION_SEED=I_UNDERSTAND_THIS_IS_DANGEROUS');
    process.exit(1);
  }

  if (isProduction && forceProduction && confirmProduction) {
    console.warn('\n⚠️  WARNING: Force-seeding PRODUCTION database!');
    console.warn('This action cannot be undone easily.');
    console.warn('Waiting 10 seconds... Press Ctrl+C to cancel.\n');
    // Synchronous delay for warning (increased to 10 seconds)
    const start = Date.now();
    while (Date.now() - start < 10000) {
      // Busy wait - intentionally blocking
    }
    console.warn('Proceeding with production seeding...\n');
  }

  if (isAllowedDev) {
    console.log('✅ Development project verified:', projectRef);
  }
}

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting Supabase seeding...\n');
  console.log('📍 Supabase URL:', supabaseUrl);

  // CRITICAL: Check production safety before proceeding
  checkProductionSafety();

  console.log('🔑 Using service role key\n');

  try {
    // Load data from JSON files
    console.log('📂 Loading data from JSON files...');
    const data = loadLearningPathsFromFiles();

    console.log(`\n📊 Data Summary:`);
    console.log(`   Topics: ${data.topics.length}`);
    console.log(`   Learning Paths: ${data.learningPaths.length}`);
    console.log(`   Tasks: ${data.tasks.length}`);

    // Seed in order: topics → learning paths → tasks
    await seedTopics(data);
    await seedLearningPaths(data);
    await seedTasks(data);

    console.log('\n✅ Seeding complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Verify data in Supabase dashboard');
    console.log('   2. Test authentication flow');
    console.log('   3. Test data access with authenticated user');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
main();
