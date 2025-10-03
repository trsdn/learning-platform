#!/usr/bin/env python3
"""
Generate Spanish audio files from vocabulary in learning path JSON files.
Uses gTTS (Google Text-to-Speech) for free, high-quality Spanish pronunciation.
"""

import json
import os
import re
from pathlib import Path
from typing import Set, Dict
from gtts import gTTS

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
LEARNING_PATHS_DIR = PROJECT_ROOT / "public" / "learning-paths" / "spanisch"
AUDIO_OUTPUT_DIR = PROJECT_ROOT / "public" / "audio" / "spanish"
MANIFEST_FILE = AUDIO_OUTPUT_DIR / "manifest.json"

def normalize_filename(text: str) -> str:
    """
    Normalize Spanish text to create a valid filename.
    Examples:
        "Hola" -> "hola"
        "¿Cómo estás?" -> "como-estas"
        "Buenos días" -> "buenos-dias"
    """
    # Convert to lowercase
    text = text.lower()

    # Remove question marks, exclamation marks, periods, commas
    text = re.sub(r'[¿?¡!.,;:()]', '', text)

    # Replace accented characters
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n'
    }
    for accented, plain in replacements.items():
        text = text.replace(accented, plain)

    # Replace spaces and slashes with hyphens
    text = re.sub(r'[\s/]+', '-', text)

    # Remove any remaining non-alphanumeric characters (except hyphens)
    text = re.sub(r'[^a-z0-9-]', '', text)

    # Remove consecutive hyphens
    text = re.sub(r'-+', '-', text)

    # Remove leading/trailing hyphens
    text = text.strip('-')

    return text

def extract_spanish_text_from_json(json_file: Path) -> Set[str]:
    """Extract all Spanish text from a learning path JSON file."""
    spanish_texts = set()

    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    tasks = data.get('tasks', [])

    for task in tasks:
        content = task.get('content', {})
        task_type = task.get('type', '')

        # Multiple choice - Spanish options
        if task_type == 'multiple-choice':
            options = content.get('options', [])
            for option in options:
                if is_spanish_text(option):
                    spanish_texts.add(option)

        # Text input - Spanish answers
        elif task_type == 'text-input':
            correct_answer = content.get('correctAnswer', '')
            if is_spanish_text(correct_answer):
                spanish_texts.add(correct_answer)

            alternatives = content.get('alternatives', [])
            for alt in alternatives:
                if is_spanish_text(alt):
                    spanish_texts.add(alt)

        # Flashcard - Spanish front/back
        elif task_type == 'flashcard':
            front = content.get('front', '')
            back = content.get('back', '')
            front_lang = content.get('frontLanguage', '')
            back_lang = content.get('backLanguage', '')

            if front_lang == 'es' and is_spanish_text(front):
                spanish_texts.add(front)
            if back_lang == 'es' and is_spanish_text(back):
                spanish_texts.add(back)

        # Matching - Spanish pairs
        elif task_type == 'matching':
            pairs = content.get('pairs', [])
            for pair in pairs:
                left = pair.get('left', '')
                right = pair.get('right', '')

                if is_spanish_text(left):
                    spanish_texts.add(left)
                if is_spanish_text(right):
                    spanish_texts.add(right)

        # Drag and drop - Spanish items
        elif task_type == 'drag-and-drop':
            items = content.get('items', [])
            for item in items:
                if is_spanish_text(item):
                    spanish_texts.add(item)

    return spanish_texts

def is_spanish_text(text: str) -> bool:
    """
    Check if text is likely Spanish (contains Spanish characters or common patterns).
    This is a simple heuristic - adjust as needed.
    """
    if not text or not isinstance(text, str):
        return False

    # Check for Spanish-specific characters
    spanish_chars = ['¿', '¡', 'ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü']
    if any(char in text.lower() for char in spanish_chars):
        return True

    # Check for common Spanish words
    common_spanish = [
        'hola', 'adiós', 'gracias', 'por favor', 'buenos días', 'buenas tardes',
        'buenas noches', 'cómo', 'qué', 'dónde', 'cuándo', 'me llamo', 'soy',
        'el', 'la', 'los', 'las', 'un', 'una', 'perro', 'gato', 'padre', 'madre'
    ]
    text_lower = text.lower()
    if any(word in text_lower for word in common_spanish):
        return True

    return False

def generate_audio_file(text: str, output_path: Path) -> bool:
    """Generate MP3 audio file for Spanish text using gTTS."""
    try:
        # Create gTTS object with Spanish language
        tts = gTTS(text=text, lang='es', slow=False)

        # Save to file
        tts.save(str(output_path))

        print(f"✓ Generated: {output_path.name} for '{text}'")
        return True

    except Exception as e:
        print(f"✗ Failed to generate audio for '{text}': {e}")
        return False

def main():
    """Main function to generate all Spanish audio files."""
    print("🎵 Spanish Audio Generator")
    print("=" * 60)

    # Create output directory
    AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {AUDIO_OUTPUT_DIR}")

    # Collect all Spanish texts from JSON files
    all_spanish_texts: Set[str] = set()

    if not LEARNING_PATHS_DIR.exists():
        print(f"❌ Error: Learning paths directory not found: {LEARNING_PATHS_DIR}")
        return

    json_files = list(LEARNING_PATHS_DIR.glob("*.json"))
    print(f"📂 Found {len(json_files)} JSON files")

    for json_file in json_files:
        print(f"📄 Processing: {json_file.name}")
        spanish_texts = extract_spanish_text_from_json(json_file)
        all_spanish_texts.update(spanish_texts)

    print(f"\n📊 Found {len(all_spanish_texts)} unique Spanish texts")
    print("=" * 60)

    # Generate audio files and build manifest
    manifest: Dict[str, str] = {}
    success_count = 0

    for text in sorted(all_spanish_texts):
        # Generate filename
        filename = normalize_filename(text) + ".mp3"
        output_path = AUDIO_OUTPUT_DIR / filename

        # Skip if file already exists
        if output_path.exists():
            print(f"⊘ Skipped: {filename} (already exists)")
            manifest[text] = filename
            success_count += 1
            continue

        # Generate audio
        if generate_audio_file(text, output_path):
            manifest[text] = filename
            success_count += 1

    # Save manifest
    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2, sort_keys=True)

    print("=" * 60)
    print(f"✅ Successfully generated {success_count}/{len(all_spanish_texts)} audio files")
    print(f"📝 Manifest saved to: {MANIFEST_FILE}")
    print(f"🎵 Audio files saved to: {AUDIO_OUTPUT_DIR}")
    print("\n🚀 Audio generation complete!")

if __name__ == "__main__":
    main()
