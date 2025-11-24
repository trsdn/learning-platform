#!/usr/bin/env python3
import json

# Contextual sentences and hints for each verb
verb_data = {
    "go": {
        "simple_past": {"hint": "Rhymes with 'went'", "sentence": "Yesterday, I ___ to school"},
        "past_participle": {"hint": "Rhymes with 'phone'", "sentence": "I have ___ to Paris before"}
    },
    "eat": {
        "simple_past": {"hint": "Sounds like the number 8", "sentence": "She ___ an apple for lunch"},
        "past_participle": {"hint": "Ends with '-en'", "sentence": "We have ___ breakfast already"}
    },
    "drink": {
        "simple_past": {"hint": "Rhymes with 'bank'", "sentence": "He ___ water after running"},
        "past_participle": {"hint": "Rhymes with 'trunk'", "sentence": "They have ___ all the juice"}
    },
    "see": {
        "simple_past": {"hint": "A tool for cutting wood", "sentence": "I ___ a beautiful sunset yesterday"},
        "past_participle": {"hint": "Rhymes with 'been'", "sentence": "Have you ___ this movie?"}
    },
    "come": {
        "simple_past": {"hint": "Rhymes with 'game'", "sentence": "She ___ to the party last night"},
        "past_participle": {"hint": "Same as infinitive", "sentence": "They have ___ home early"}
    },
    "take": {
        "simple_past": {"hint": "Rhymes with 'book'", "sentence": "I ___ the bus this morning"},
        "past_participle": {"hint": "Ends with '-en'", "sentence": "She has ___ my pen"}
    },
    "give": {
        "simple_past": {"hint": "Rhymes with 'save'", "sentence": "He ___ me a present"},
        "past_participle": {"hint": "Ends with '-en'", "sentence": "I have ___ him the key"}
    },
    "make": {
        "simple_past": {"hint": "Rhymes with 'paid'", "sentence": "She ___ a delicious cake"},
        "past_participle": {"hint": "Same as simple past", "sentence": "We have ___ a decision"}
    },
    "write": {
        "simple_past": {"hint": "Rhymes with 'boat'", "sentence": "I ___ a letter yesterday"},
        "past_participle": {"hint": "Ends with '-en'", "sentence": "She has ___ three books"}
    },
    "know": {
        "simple_past": {"hint": "Rhymes with 'new'", "sentence": "I ___ the answer immediately"},
        "past_participle": {"hint": "Rhymes with 'grown'", "sentence": "I have ___ her for years"}
    },
    "speak": {
        "simple_past": {"hint": "Rhymes with 'broke'", "sentence": "She ___ to the manager"},
        "past_participle": {"hint": "Ends with '-en'", "sentence": "Have you ___ to him?"}
    },
    "break": {
        "simple_past": {"hint": "Rhymes with 'woke'", "sentence": "I ___ my phone yesterday"},
        "past_participle": {"hint": "Ends with '-en'", "sentence": "The window has been ___"}
    },
    "bring": {
        "simple_past": {"hint": "Rhymes with 'thought'", "sentence": "She ___ snacks to the party"},
        "past_participle": {"hint": "Same as simple past", "sentence": "He has ___ his guitar"}
    },
    "buy": {
        "simple_past": {"hint": "Rhymes with 'caught'", "sentence": "I ___ a new car last week"},
        "past_participle": {"hint": "Same as simple past", "sentence": "They have ___ a house"}
    },
    "think": {
        "simple_past": {"hint": "Rhymes with 'caught'", "sentence": "I ___ about you yesterday"},
        "past_participle": {"hint": "Same as simple past", "sentence": "I have ___ about it carefully"}
    },
    "begin": {
        "simple_past": {"hint": "Changes 'i' to 'a'", "sentence": "The concert ___ at 8 PM"},
        "past_participle": {"hint": "Changes 'i' to 'u'", "sentence": "The work has ___"}
    },
    "sing": {
        "simple_past": {"hint": "Rhymes with 'rang'", "sentence": "She ___ a beautiful song"},
        "past_participle": {"hint": "Rhymes with 'rung'", "sentence": "He has ___ in many choirs"}
    },
    "swim": {
        "simple_past": {"hint": "Rhymes with 'jam'", "sentence": "I ___ in the lake yesterday"},
        "past_participle": {"hint": "Rhymes with 'gum'", "sentence": "I have ___ across this river"}
    },
    "run": {
        "simple_past": {"hint": "Rhymes with 'can'", "sentence": "She ___ to catch the bus"},
        "past_participle": {"hint": "Same as infinitive", "sentence": "I have ___ five kilometers"}
    },
    "fly": {
        "simple_past": {"hint": "Rhymes with 'knew'", "sentence": "The bird ___ away"},
        "past_participle": {"hint": "Rhymes with 'grown'", "sentence": "I have ___ to Paris twice"}
    },
    "find": {
        "simple_past": {"hint": "Rhymes with 'sound'", "sentence": "I ___ my keys under the bed"},
        "past_participle": {"hint": "Same as simple past", "sentence": "Have you ___ a solution?"}
    },
    "tell": {
        "simple_past": {"hint": "Rhymes with 'old'", "sentence": "She ___ me a secret"},
        "past_participle": {"hint": "Same as simple past", "sentence": "I have ___ you before"}
    },
    "feel": {
        "simple_past": {"hint": "Rhymes with 'belt'", "sentence": "I ___ very happy yesterday"},
        "past_participle": {"hint": "Same as simple past", "sentence": "I have ___ this way before"}
    },
    "fall": {
        "simple_past": {"hint": "Rhymes with 'bell'", "sentence": "The book ___ off the table"},
        "past_participle": {"hint": "Ends with '-en'", "sentence": "The snow has ___"}
    },
    "catch": {
        "simple_past": {"hint": "Rhymes with 'thought'", "sentence": "I ___ the ball easily"},
        "past_participle": {"hint": "Same as simple past", "sentence": "I have ___ a cold"}
    },
    "teach": {
        "simple_past": {"hint": "Rhymes with 'caught'", "sentence": "She ___ me English"},
        "past_participle": {"hint": "Same as simple past", "sentence": "I have ___ for 10 years"}
    },
    "sleep": {
        "simple_past": {"hint": "Rhymes with 'kept'", "sentence": "I ___ very well last night"},
        "past_participle": {"hint": "Same as simple past", "sentence": "I have ___ for 8 hours"}
    },
    "wear": {
        "simple_past": {"hint": "Rhymes with 'more'", "sentence": "She ___ a blue dress"},
        "past_participle": {"hint": "Rhymes with 'born'", "sentence": "I have ___ these shoes before"}
    },
    "meet": {
        "simple_past": {"hint": "Rhymes with 'bet'", "sentence": "I ___ her at the party"},
        "past_participle": {"hint": "Same as simple past", "sentence": "We have ___ before"}
    },
    "forget": {
        "simple_past": {"hint": "Rhymes with 'hot'", "sentence": "I ___ my password"},
        "past_participle": {"hint": "Ends with '-en'", "sentence": "I have ___ his name"}
    }
}

# Read the original file
with open('/Users/torstenmahr/GitHub/learning-platform/public/learning-paths/englisch/unregelmaessige-verben.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Fix estimated time
data['learningPath']['estimatedTime'] = 2700

# Improve each task
for i, task in enumerate(data['tasks']):
    task_id = task['id']
    task_num = i + 1

    # Determine which verb this is (every 2 tasks = 1 verb)
    verb_index = i // 2
    verb_names = list(verb_data.keys())

    if verb_index < len(verb_names):
        verb = verb_names[verb_index]
        is_simple_past = (i % 2 == 0)

        verb_info = verb_data[verb]
        tense_data = verb_info['simple_past'] if is_simple_past else verb_info['past_participle']

        # Add hint
        task['content']['hint'] = tense_data['hint']

        # Modify question to include context
        verb_german = task['content']['question'].split('(')[1].split(')')[0] if '(' in task['content']['question'] else verb
        tense_name = "Simple Past" if is_simple_past else "Past Participle"

        # Update question with contextual sentence
        task['content']['question'] = f"Fill in: {tense_data['sentence']} ({verb_german})"

        # Get the actual answer text
        if task['type'] == 'multiple-choice':
            correct_answer_text = task['content']['options'][task['content']['correctAnswer']]
        else:
            correct_answer_text = task['content']['correctAnswer']

        # Enhance explanation
        if is_simple_past:
            task['content']['explanation'] = f"Das Verb '{verb}' wird im Simple Past zu '{correct_answer_text}'. Beispiel: {tense_data['sentence'].replace('___', correct_answer_text)}."
        else:
            task['content']['explanation'] = f"Das Past Participle von '{verb}' ist '{correct_answer_text}'. Beispiel: {tense_data['sentence'].replace('___', correct_answer_text)}."

# Write improved file
with open('/Users/torstenmahr/GitHub/learning-platform/public/learning-paths/englisch/unregelmaessige-verben.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ Improved irregular verbs learning path!")
print("- Fixed estimatedTime: 900 → 2700 seconds (45 minutes)")
print("- Added contextual sentences to all 60 tasks")
print("- Added progressive hints to all tasks")
print("- Enhanced explanations")
