# English Irregular Verbs Audio Files

This directory should contain pronunciation audio files for English irregular verbs.

## Required Audio Files

90 MP3 files total (30 verbs × 3 forms each):

### Verbs A-F
- go.mp3, went.mp3, gone.mp3
- eat.mp3, ate.mp3, eaten.mp3
- drink.mp3, drank.mp3, drunk.mp3
- see.mp3, saw.mp3, seen.mp3
- come.mp3, came.mp3, come.mp3
- take.mp3, took.mp3, taken.mp3
- give.mp3, gave.mp3, given.mp3
- make.mp3, made.mp3, made.mp3
- write.mp3, wrote.mp3, written.mp3
- know.mp3, knew.mp3, known.mp3
- speak.mp3, spoke.mp3, spoken.mp3
- break.mp3, broke.mp3, broken.mp3
- bring.mp3, brought.mp3, brought.mp3
- buy.mp3, bought.mp3, bought.mp3
- think.mp3, thought.mp3, thought.mp3
- begin.mp3, began.mp3, begun.mp3
- sing.mp3, sang.mp3, sung.mp3
- swim.mp3, swam.mp3, swum.mp3
- run.mp3, ran.mp3, run.mp3
- fly.mp3, flew.mp3, flown.mp3
- find.mp3, found.mp3, found.mp3

### Verbs T-W
- tell.mp3, told.mp3, told.mp3
- feel.mp3, felt.mp3, felt.mp3
- fall.mp3, fell.mp3, fallen.mp3
- catch.mp3, caught.mp3, caught.mp3
- teach.mp3, taught.mp3, taught.mp3
- sleep.mp3, slept.mp3, slept.mp3
- wear.mp3, wore.mp3, worn.mp3
- meet.mp3, met.mp3, met.mp3
- forget.mp3, forgot.mp3, forgotten.mp3

## How to Generate Audio Files

### Option 1: Using the Python Script (Recommended)

```bash
# Install gTTS (Google Text-to-Speech)
pip install gtts

# Run the generation script
python3 generate-audio.py
```

The script will automatically:
- Generate all 90 MP3 files
- Save them to this directory
- Skip files that already exist

### Option 2: Using Online TTS Services

Visit services like:
- **Google Cloud Text-to-Speech**: https://cloud.google.com/text-to-speech
- **Amazon Polly**: https://aws.amazon.com/polly/
- **Microsoft Azure Speech**: https://azure.microsoft.com/en-us/services/cognitive-services/text-to-speech/

Generate British or American English pronunciations for each verb form.

### Option 3: Record Your Own

Record yourself or a native speaker pronouncing each word clearly, then save as MP3 files with the correct filenames.

## Audio Format Requirements

- **Format**: MP3
- **Sample Rate**: 44.1 kHz (CD quality) or 22.05 kHz
- **Bit Rate**: 128 kbps or higher
- **Duration**: 0.5-1.5 seconds per word
- **Volume**: Normalized to -3dB peak

## Testing Audio

After generating the files, test them in the learning platform:
1. Start the learning path: "Unregelmäßige Verben - Englisch"
2. Click the audio button (🔊) next to each answer
3. Verify pronunciation is clear and correct

## Notes

- Audio is marked with `hasAudio: true` and `audioUrl` in the JSON
- Files are loaded from `/audio/english/verbs/` (relative to public dir)
- The platform's AudioButton component handles playback
- Audio buttons will show as disabled (🔇) until files are present
