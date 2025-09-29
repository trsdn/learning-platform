# Learning Path Data Files

This directory contains complete learning path examples in JSON format for **6. Klasse Gymnasium Niedersachsen** (Grade 6 Gymnasium, Lower Saxony curriculum).

## 📚 Available Learning Paths

### Mathematik

#### 1. `algebra-basics.json`
- **Topic**: Mathematik
- **Title**: Algebra Grundlagen
- **Difficulty**: Easy (Leicht)
- **Tasks**: 5 tasks on linear equations
- **Time**: ~60 minutes
- **Content**:
  - Simple linear equations (2x + 4 = 10)
  - Division equations (x/4 + 2 = 5)
  - Bracket expansion (3(x + 2) = 15)

#### 2. `geometry-basics.json`
- **Topic**: Mathematik
- **Title**: Geometrie Grundlagen
- **Difficulty**: Medium (Mittel)
- **Tasks**: 5 tasks on shapes, areas, and angles
- **Time**: ~75 minutes
- **Content**:
  - Triangle angle sum (180°)
  - Rectangle area calculation
  - Circle circumference (2πr)
  - Polygon identification (hexagon)
  - Triangle area formula

### Biologie

#### 3. `zellbiologie.json`
- **Topic**: Biologie
- **Title**: Zellbiologie
- **Difficulty**: Easy (Leicht)
- **Tasks**: 5 tasks on cell structure and organelles
- **Time**: ~50 minutes
- **Content**:
  - Mitochondria (energy production)
  - Cell wall vs. cell membrane
  - Nucleus function
  - Chloroplasts (photosynthesis)
  - Ribosomes (protein synthesis)

#### 4. `genetik-basics.json`
- **Topic**: Biologie
- **Title**: Genetik Grundlagen
- **Difficulty**: Medium (Mittel)
- **Tasks**: 5 tasks on DNA, heredity, and genetics
- **Time**: ~65 minutes
- **Content**:
  - DNA location (nucleus)
  - Human chromosomes (46)
  - DNA abbreviation (Desoxyribonukleinsäure)
  - Mendel's laws of inheritance
  - Mutations

## 📋 JSON File Structure

Each JSON file contains:

```json
{
  "learningPath": {
    "id": "unique-id",
    "topicId": "mathematik|biologie",
    "title": "Display title",
    "description": "Description with grade level",
    "difficulty": "easy|medium|hard",
    "estimatedTime": 60,
    "isActive": true,
    "requirements": {
      "minimumAccuracy": 70,
      "requiredTasks": 5
    }
  },
  "tasks": [
    {
      "id": "task-id",
      "learningPathId": "learning-path-id",
      "templateId": "multiple-choice-basic",
      "type": "multiple-choice",
      "content": {
        "question": "Question text in German",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 1,
        "explanation": "Detailed explanation",
        "hint": "Optional hint for students"
      },
      "metadata": {
        "difficulty": "easy|medium|hard",
        "tags": ["tag1", "tag2"],
        "estimatedTime": 30,
        "points": 10
      }
    }
  ]
}
```

## 🎯 Curriculum Alignment

All content is aligned with the **Niedersachsen Kerncurriculum** for Grade 6:

- **Mathematik**: KC Mathematik Gymnasium, Schuljahrgänge 5-10
- **Biologie**: KC Naturwissenschaften Gymnasium, Schuljahrgänge 5-10

## 🔄 Current Status

⚠️ **These JSON files are currently NOT loaded by the application.**

The app currently uses hard-coded data from `src/modules/storage/seed-data.ts`.

### To Use These Files in the App:

1. Create a JSON loader service in `src/modules/storage/json-loader.ts`
2. Update `seed-data.ts` to import from JSON files
3. Configure Vite to include JSON files in build
4. Add error handling for missing/invalid JSON

## 🚀 Future Enhancements

- Dynamic loading from external URLs
- Import/export functionality
- Teacher content editor
- Version control for learning paths
- Multi-language support
- Adaptive difficulty based on performance

## 📝 Adding New Content

To add a new learning path:

1. Copy one of the existing JSON files
2. Change the `id`, `topicId`, `title`, and `description`
3. Update all task IDs to be unique
4. Modify questions, options, and explanations
5. Ensure curriculum alignment
6. Test JSON validity: `cat file.json | jq .`