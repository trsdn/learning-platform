#!/usr/bin/env python3
"""
Add frontAudio/backAudio fields to Spanish flashcard JSON files.
This script scans all Spanish learning path JSONs and adds audio paths
to flashcards based on their language.
"""

import json
import re
from pathlib import Path


def text_to_audio_filename(text: str) -> str:
    """
    Convert Spanish text to audio filename.
    Examples:
        "Buenos días" -> "buenos-dias"
        "¿Cómo estás?" -> "como-estas"
        "Hola" -> "hola"
    """
    # Remove punctuation
    text = re.sub(r'[¿¡…?!,.()\[\]{}]', '', text)

    # Replace accented characters
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ñ': 'N'
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    # Convert to lowercase and replace spaces with hyphens
    text = text.lower().strip()
    text = re.sub(r'\s+', '-', text)

    return text


def add_audio_to_flashcard(task: dict) -> dict:
    """
    Add frontAudio/backAudio fields to a flashcard task if language is Spanish.
    """
    if task.get('type') != 'flashcard':
        return task

    content = task.get('content', {})

    # Add frontAudio if frontLanguage is Spanish
    if content.get('frontLanguage') == 'es' and content.get('front'):
        filename = text_to_audio_filename(content['front'])
        content['frontAudio'] = f"spanish/{filename}.mp3"

    # Add backAudio if backLanguage is Spanish
    if content.get('backLanguage') == 'es' and content.get('back'):
        filename = text_to_audio_filename(content['back'])
        content['backAudio'] = f"spanish/{filename}.mp3"

    task['content'] = content
    return task


def process_learning_path_file(filepath: Path) -> tuple[int, int]:
    """
    Process a single learning path JSON file.
    Returns (tasks_processed, flashcards_updated)
    """
    print(f"Processing {filepath.name}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    tasks = data.get('tasks', [])
    updated_count = 0

    for i, task in enumerate(tasks):
        old_content = task.get('content', {}).copy()
        task = add_audio_to_flashcard(task)
        tasks[i] = task

        # Check if audio was added
        new_content = task.get('content', {})
        if ('frontAudio' in new_content and 'frontAudio' not in old_content) or \
           ('backAudio' in new_content and 'backAudio' not in old_content):
            updated_count += 1

    # Write back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  ✓ Updated {updated_count} flashcards out of {len(tasks)} tasks")
    return len(tasks), updated_count


def main():
    """Main entry point."""
    # Find all Spanish learning path JSON files
    spanish_dir = Path('public/learning-paths/spanisch')

    if not spanish_dir.exists():
        print(f"Error: Directory {spanish_dir} does not exist")
        return

    json_files = list(spanish_dir.glob('*.json'))

    if not json_files:
        print(f"No JSON files found in {spanish_dir}")
        return

    print(f"Found {len(json_files)} Spanish learning path files\n")

    total_tasks = 0
    total_updated = 0

    for filepath in sorted(json_files):
        tasks, updated = process_learning_path_file(filepath)
        total_tasks += tasks
        total_updated += updated

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Total tasks processed: {total_tasks}")
    print(f"  Flashcards updated with audio: {total_updated}")
    print(f"{'='*60}")

    if total_updated > 0:
        print("\nNote: Audio files need to be generated separately.")
        print("Run: python scripts/generate-audio-files.py")


if __name__ == '__main__':
    main()
