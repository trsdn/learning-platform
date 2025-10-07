#!/usr/bin/env python3
"""
Generate audio files for irregular English verbs using gTTS (Google Text-to-Speech)
"""
import json
import os
from pathlib import Path

# Import gTTS if available, otherwise provide instructions
try:
    from gtts import gTTS
    HAS_GTTS = True
except ImportError:
    HAS_GTTS = False
    print("⚠️  gTTS not installed. Install with: pip install gtts")
    print("    Continuing without generating audio files...")

# All verb forms that need audio
verb_forms = [
    # Infinitive, Simple Past, Past Participle
    ("go", "went", "gone"),
    ("eat", "ate", "eaten"),
    ("drink", "drank", "drunk"),
    ("see", "saw", "seen"),
    ("come", "came", "come"),
    ("take", "took", "taken"),
    ("give", "gave", "given"),
    ("make", "made", "made"),
    ("write", "wrote", "written"),
    ("know", "knew", "known"),
    ("speak", "spoke", "spoken"),
    ("break", "broke", "broken"),
    ("bring", "brought", "brought"),
    ("buy", "bought", "bought"),
    ("think", "thought", "thought"),
    ("begin", "began", "begun"),
    ("sing", "sang", "sung"),
    ("swim", "swam", "swum"),
    ("run", "ran", "run"),
    ("fly", "flew", "flown"),
    ("find", "found", "found"),
    ("tell", "told", "told"),
    ("feel", "felt", "felt"),
    ("fall", "fell", "fallen"),
    ("catch", "caught", "caught"),
    ("teach", "taught", "taught"),
    ("sleep", "slept", "slept"),
    ("wear", "wore", "worn"),
    ("meet", "met", "met"),
    ("forget", "forgot", "forgotten"),
]

# Create output directory
output_dir = Path("public/audio/english/verbs")
output_dir.mkdir(parents=True, exist_ok=True)

# Generate audio files if gTTS is available
if HAS_GTTS:
    print("🎵 Generating audio files...")
    for infinitive, simple_past, past_participle in verb_forms:
        for form in [infinitive, simple_past, past_participle]:
            # Generate audio file
            filename = f"{form}.mp3"
            filepath = output_dir / filename

            # Only generate if file doesn't exist
            if not filepath.exists():
                try:
                    tts = gTTS(text=form, lang='en', slow=False)
                    tts.save(str(filepath))
                    print(f"  ✓ Generated: {filename}")
                except Exception as e:
                    print(f"  ✗ Failed: {filename} - {e}")
            else:
                print(f"  → Exists: {filename}")

    print(f"\n✅ Audio generation complete! {len(list(output_dir.glob('*.mp3')))} files in {output_dir}")
else:
    print("\n💡 To generate audio files, install gTTS:")
    print("   pip install gtts")
    print("   Then run this script again")

# Update JSON with audio paths
print("\n📝 Updating JSON with audio paths...")

json_path = Path("public/learning-paths/englisch/unregelmaessige-verben.json")
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update each task with correctAnswerAudio
for i, task in enumerate(data['tasks']):
    verb_index = i // 2
    is_simple_past = (i % 2 == 0)

    if verb_index < len(verb_forms):
        infinitive, simple_past, past_participle = verb_forms[verb_index]
        correct_answer = simple_past if is_simple_past else past_participle

        # Add audio fields
        task['content']['correctAnswerLanguage'] = 'en'
        task['content']['correctAnswerAudio'] = f"english/verbs/{correct_answer}.mp3"
        task['hasAudio'] = True
        task['audioUrl'] = f"english/verbs/{correct_answer}.mp3"
        task['language'] = 'English'

# Save updated JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✅ Updated {json_path} with audio paths for all {len(data['tasks'])} tasks")
print("\n🎉 Done! Audio support added to irregular verbs learning path")
