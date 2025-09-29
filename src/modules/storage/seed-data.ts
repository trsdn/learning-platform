import type { Topic, LearningPath, Task } from '@core/types/services';

/**
 * Sample data for German Learning Platform
 */

export const sampleTopics: Topic[] = [
  {
    id: 'mathematik',
    title: 'Mathematik',
    description: 'Grundlagen der Mathematik: Algebra, Geometrie und mehr',
    learningPathIds: ['algebra-basics', 'geometry-basics'],
    isActive: true,
    metadata: {
      estimatedHours: 40,
      difficultyLevel: 'intermediate',
      prerequisites: [],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'biologie',
    title: 'Biologie',
    description: 'Einführung in die Biologie: Zellen, Genetik und Ökosysteme',
    learningPathIds: ['zellbiologie', 'genetik-basics'],
    isActive: true,
    metadata: {
      estimatedHours: 35,
      difficultyLevel: 'beginner',
      prerequisites: [],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const sampleLearningPaths: LearningPath[] = [
  {
    id: 'algebra-basics',
    topicId: 'mathematik',
    title: 'Algebra Grundlagen',
    description: 'Lineare und quadratische Gleichungen',
    difficulty: 'easy',
    taskIds: ['math-task-1', 'math-task-2', 'math-task-3', 'math-task-4', 'math-task-5'],
    estimatedTime: 60,
    isActive: true,
    requirements: {
      minimumAccuracy: 70,
      requiredTasks: 5,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'geometry-basics',
    topicId: 'mathematik',
    title: 'Geometrie Grundlagen',
    description: 'Flächen, Winkel und geometrische Formen',
    difficulty: 'medium',
    taskIds: ['math-task-6', 'math-task-7', 'math-task-8', 'math-task-9', 'math-task-10'],
    estimatedTime: 75,
    isActive: true,
    requirements: {
      minimumAccuracy: 75,
      requiredTasks: 5,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'zellbiologie',
    topicId: 'biologie',
    title: 'Zellbiologie',
    description: 'Aufbau und Funktion von Zellen',
    difficulty: 'easy',
    taskIds: ['bio-task-1', 'bio-task-2', 'bio-task-3', 'bio-task-4', 'bio-task-5'],
    estimatedTime: 50,
    isActive: true,
    requirements: {
      minimumAccuracy: 70,
      requiredTasks: 5,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const sampleTasks: Task[] = [
  // Math tasks - Algebra
  {
    id: 'math-task-1',
    learningPathId: 'algebra-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Was ist die Lösung für x in der Gleichung: 2x + 4 = 10?',
      options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
      correctAnswer: 1,
      explanation: 'Um die Gleichung zu lösen: 2x = 10 - 4, also 2x = 6, daher x = 3',
      hint: 'Subtrahiere 4 von beiden Seiten und teile dann durch 2',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['algebra', 'gleichungen', 'grundrechenarten'],
      estimatedTime: 30,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'math-task-2',
    learningPathId: 'algebra-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Welche Zahl ergibt sich aus: 5x - 15 = 0?',
      options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
      correctAnswer: 1,
      explanation: '5x = 15, daher x = 15 ÷ 5 = 3',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['algebra', 'gleichungen'],
      estimatedTime: 25,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'math-task-3',
    learningPathId: 'algebra-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Was ist das Ergebnis von: 3(x + 2) = 15?',
      options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
      correctAnswer: 2,
      explanation: 'Erst ausmultiplizieren: 3x + 6 = 15, dann 3x = 9, also x = 3',
    },
    metadata: {
      difficulty: 'medium',
      tags: ['algebra', 'gleichungen', 'klammerrechnung'],
      estimatedTime: 35,
      points: 15,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'math-task-4',
    learningPathId: 'algebra-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Löse die Gleichung: x/4 + 2 = 5',
      options: ['x = 8', 'x = 10', 'x = 12', 'x = 14'],
      correctAnswer: 2,
      explanation: 'x/4 = 3, also x = 12',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['algebra', 'gleichungen', 'division'],
      estimatedTime: 30,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'math-task-5',
    learningPathId: 'algebra-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Was ist x in: 2x - 3 = 7?',
      options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
      correctAnswer: 2,
      explanation: '2x = 10, also x = 5',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['algebra', 'gleichungen'],
      estimatedTime: 25,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Math tasks - Geometry
  {
    id: 'math-task-6',
    learningPathId: 'geometry-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Wie viele Grad hat ein Dreieck insgesamt?',
      options: ['90°', '180°', '270°', '360°'],
      correctAnswer: 1,
      explanation: 'Die Innenwinkelsumme eines Dreiecks beträgt immer 180°',
      hint: 'Es ist weniger als ein Kreis (360°)',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['geometrie', 'winkel', 'dreieck'],
      estimatedTime: 25,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'math-task-7',
    learningPathId: 'geometry-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Wie berechnet man die Fläche eines Rechtecks?',
      options: ['Länge + Breite', 'Länge × Breite', '2 × (Länge + Breite)', 'Länge²'],
      correctAnswer: 1,
      explanation: 'Die Fläche eines Rechtecks ist Länge × Breite',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['geometrie', 'fläche', 'rechteck'],
      estimatedTime: 25,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'math-task-8',
    learningPathId: 'geometry-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Was ist der Umfang eines Kreises mit Radius 5cm? (π ≈ 3.14)',
      options: ['15.7 cm', '31.4 cm', '78.5 cm', '157 cm'],
      correctAnswer: 1,
      explanation: 'Umfang = 2πr = 2 × 3.14 × 5 = 31.4 cm',
    },
    metadata: {
      difficulty: 'medium',
      tags: ['geometrie', 'kreis', 'umfang'],
      estimatedTime: 35,
      points: 15,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'math-task-9',
    learningPathId: 'geometry-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Wie viele Seiten hat ein Hexagon?',
      options: ['4', '5', '6', '7'],
      correctAnswer: 2,
      explanation: 'Ein Hexagon (Sechseck) hat 6 Seiten',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['geometrie', 'formen', 'polygon'],
      estimatedTime: 20,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'math-task-10',
    learningPathId: 'geometry-basics',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Was ist die Fläche eines Dreiecks mit Basis 6cm und Höhe 4cm?',
      options: ['10 cm²', '12 cm²', '24 cm²', '48 cm²'],
      correctAnswer: 1,
      explanation: 'Fläche = (Basis × Höhe) / 2 = (6 × 4) / 2 = 12 cm²',
    },
    metadata: {
      difficulty: 'medium',
      tags: ['geometrie', 'fläche', 'dreieck'],
      estimatedTime: 30,
      points: 15,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Biology tasks
  {
    id: 'bio-task-1',
    learningPathId: 'zellbiologie',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Was ist die Hauptfunktion der Mitochondrien in einer Zelle?',
      options: [
        'Proteinherstellung',
        'Energieproduktion',
        'DNA-Speicherung',
        'Zellteilung',
      ],
      correctAnswer: 1,
      explanation:
        'Mitochondrien sind die "Kraftwerke" der Zelle und produzieren Energie in Form von ATP',
      hint: 'Denke an die "Kraftwerke" der Zelle',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['zellbiologie', 'mitochondrien', 'zellorganellen'],
      estimatedTime: 30,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'bio-task-2',
    learningPathId: 'zellbiologie',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Welche Struktur umgibt die Pflanzenzelle, aber nicht die Tierzelle?',
      options: ['Zellmembran', 'Zellwand', 'Zellkern', 'Cytoplasma'],
      correctAnswer: 1,
      explanation:
        'Die Zellwand aus Cellulose ist typisch für Pflanzenzellen und gibt ihnen Struktur und Stabilität',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['zellbiologie', 'pflanzenzellen', 'zellwand'],
      estimatedTime: 25,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'bio-task-3',
    learningPathId: 'zellbiologie',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Was ist die Funktion des Zellkerns?',
      options: [
        'Energieproduktion',
        'Proteinsynthese',
        'DNA-Speicherung und Regulation',
        'Abfallbeseitigung',
      ],
      correctAnswer: 2,
      explanation: 'Der Zellkern enthält die DNA und steuert alle Zellfunktionen',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['zellbiologie', 'zellkern', 'DNA'],
      estimatedTime: 30,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'bio-task-4',
    learningPathId: 'zellbiologie',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Welche Organelle ist für die Photosynthese verantwortlich?',
      options: ['Mitochondrien', 'Chloroplasten', 'Ribosomen', 'Golgi-Apparat'],
      correctAnswer: 1,
      explanation: 'Chloroplasten enthalten Chlorophyll und führen die Photosynthese durch',
      hint: 'Diese Organelle macht Pflanzen grün',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['zellbiologie', 'photosynthese', 'chloroplasten'],
      estimatedTime: 30,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'bio-task-5',
    learningPathId: 'zellbiologie',
    templateId: 'multiple-choice-basic',
    type: 'multiple-choice',
    content: {
      question: 'Was produzieren Ribosomen in der Zelle?',
      options: ['Energie (ATP)', 'Proteine', 'Lipide', 'DNA'],
      correctAnswer: 1,
      explanation: 'Ribosomen sind die "Proteinfabriken" der Zelle',
    },
    metadata: {
      difficulty: 'medium',
      tags: ['zellbiologie', 'ribosomen', 'proteine'],
      estimatedTime: 35,
      points: 15,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

/**
 * Seeds the database with sample data
 */
export async function seedDatabase(db: any): Promise<void> {
  // Clear existing data
  await db.topics.clear();
  await db.learningPaths.clear();
  await db.tasks.clear();

  // Add sample data
  await db.topics.bulkAdd(sampleTopics);
  await db.learningPaths.bulkAdd(sampleLearningPaths);
  await db.tasks.bulkAdd(sampleTasks);

  console.log('✅ Database seeded with sample data');
}