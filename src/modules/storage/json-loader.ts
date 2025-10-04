import type { Topic, LearningPath, Task } from '@core/types/services';

/**
 * Interface for learning path JSON files
 */
interface LearningPathData {
  learningPath: Omit<LearningPath, 'createdAt' | 'updatedAt'> & { createdAt?: string };
  tasks: Omit<Task, 'createdAt' | 'updatedAt'>[];
}

/**
 * Load all learning path JSON files from public/learning-paths/ directory
 * Uses fetch API to load files from public directory
 */
export async function loadLearningPathsFromJSON(): Promise<{
  topics: Topic[];
  learningPaths: LearningPath[];
  tasks: Task[];
}> {
  const topics: Map<string, Topic> = new Map();
  const learningPaths: LearningPath[] = [];
  const tasks: Task[] = [];

  // Learning path files to load (topic -> filenames)
  const learningPathFiles: Record<string, string[]> = {
    mathematik: ['algebra-basics.json', 'geometry-basics.json', 'advanced-tasks.json', 'brueche-grundlagen.json'],
    biologie: ['zellbiologie.json', 'genetik-basics.json'],
    spanisch: ['spanisch-grundlagen.json', 'begruessung-vorstellung.json', 'familie-persoenliches.json', 'zahlen-farben-tiere.json', 'vokabeltest-karteikarten.json'],
    test: ['all-task-types.json'],
  };

  // Load each learning path
  for (const [topicId, files] of Object.entries(learningPathFiles)) {
    // Create topic if it doesn't exist
    if (!topics.has(topicId)) {
      const topic: Topic = createTopicFromId(topicId);
      topics.set(topicId, topic);
    }

    // Load each file for this topic
    for (const filename of files) {
      try {
        // Use relative path to work with base URL (e.g., /learning-platform/)
        const baseUrl = (import.meta as any).env?.BASE_URL || '/';
        const path = `${baseUrl}learning-paths/${topicId}/${filename}`;
        const response = await fetch(path);

        if (!response.ok) {
          console.warn(`Failed to load ${path}: ${response.status}`);
          continue;
        }

        const data: LearningPathData = await response.json();

        // Build task IDs array from tasks
        const taskIds = data.tasks.map((task) => task.id);

        // Add learning path with task IDs
        const learningPath: LearningPath = {
          ...data.learningPath,
          taskIds, // Add task IDs
          createdAt: data.learningPath.createdAt ? new Date(data.learningPath.createdAt) : new Date('2024-01-01'),
          updatedAt: data.learningPath.createdAt ? new Date(data.learningPath.createdAt) : new Date('2024-01-01'),
        };
        learningPaths.push(learningPath);

        // Add learning path ID to topic
        const topic = topics.get(topicId)!;
        if (!topic.learningPathIds.includes(learningPath.id)) {
          topic.learningPathIds.push(learningPath.id);
        }

        // Add tasks with audio enrichment
        for (const taskData of data.tasks) {
          const task: Task = {
            ...taskData,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            ...enrichTaskWithAudio(taskData, topicId), // Add audio fields
          };
          tasks.push(task);
        }
      } catch (error) {
        console.error(`Failed to load learning path ${topicId}/${filename}:`, error);
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
 * Enrich task with audio data for language learning topics
 * Automatically generates audio URLs for Spanish vocabulary
 */
function enrichTaskWithAudio(
  task: Omit<Task, 'createdAt' | 'updatedAt'>,
  topicId: string
): Partial<Task> {
  // Only add audio for language learning topics
  if (topicId !== 'spanisch') {
    return {};
  }

  // Extract Spanish text from task content
  let spanishText = extractSpanishText(task);
  if (!spanishText) {
    return {};
  }

  // Convert Spanish text to audio filename
  const audioFilename = spanishTextToAudioFilename(spanishText);
  const audioUrl = `/audio/spanish/${audioFilename}.mp3`;

  return {
    hasAudio: true,
    audioUrl,
    language: 'es',
  };
}

/**
 * Extract Spanish text from task content
 * Handles multiple task types (multiple-choice, text-input, flashcard, etc.)
 */
function extractSpanishText(task: Omit<Task, 'createdAt' | 'updatedAt'>): string | null {
  const content = task.content as any;

  // Multiple choice: extract correct answer text
  if (task.type === 'multiple-choice' && content.options && typeof content.correctAnswer === 'number') {
    return content.options[content.correctAnswer] || null;
  }

  // Text input: use correct answer
  if (task.type === 'text-input' && content.correctAnswer) {
    return content.correctAnswer;
  }

  // Flashcard: use front text
  if (task.type === 'flashcard' && content.front) {
    return content.front;
  }

  // Matching: extract first left text
  if (task.type === 'matching' && content.pairs && content.pairs.length > 0) {
    return content.pairs[0].left || null;
  }

  // Ordering: join items
  if (task.type === 'ordering' && content.items && content.items.length > 0) {
    return content.items.join(' ');
  }

  return null;
}

/**
 * Convert Spanish text to audio filename
 * Examples:
 *   "Buenos días" -> "buenos-dias"
 *   "¿Cómo estás?" -> "como-estas"
 *   "Hola" -> "hola"
 */
function spanishTextToAudioFilename(text: string): string {
  return text
    .toLowerCase()
    .replace(/¿|¡|\.\.\.|\?|!|,|\.|\(|\)/g, '') // Remove punctuation
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
}

/**
 * Create a Topic object from topic ID
 */
function createTopicFromId(topicId: string): Topic {
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
    chemie: {
      id: 'chemie',
      title: 'Chemie',
      description: 'Grundlagen der Chemie: Atome, Moleküle und Reaktionen',
      metadata: {
        estimatedHours: 40,
        difficultyLevel: 'intermediate',
        prerequisites: [],
      },
    },
    physik: {
      id: 'physik',
      title: 'Physik',
      description: 'Einführung in die Physik: Kräfte, Energie und Bewegung',
      metadata: {
        estimatedHours: 45,
        difficultyLevel: 'intermediate',
        prerequisites: [],
      },
    },
  };

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

  return {
    id: config.id!,
    title: config.title!,
    description: config.description!,
    learningPathIds: [],
    isActive: true,
    metadata: config.metadata!,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };
}

