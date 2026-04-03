import re
import json

# Read the JavaScript file
with open('frontend/static/iq_assessment.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the QUESTIONS array using regex
# Find the array definition
match = re.search(r'var QUESTIONS = \[([\s\S]*?)\];', content)
if not match:
    print("Could not find QUESTIONS array")
    exit(1)

array_str = match.group(1)

# Remove customHtml and customOptsHtml as they are complex
array_str = re.sub(r'customHtml: `[\s\S]*?`,', '', array_str)
array_str = re.sub(r'customOptsHtml: \[[\s\S]*?\],', '', array_str)

# Replace single quotes with double quotes, but carefully
# First, handle strings inside
array_str = re.sub(r"'([^']*)'", r'"\1"', array_str)

# Remove trailing commas before } or ]
array_str = re.sub(r',\s*([}\]])', r'\1', array_str)

# Wrap in brackets
json_str = '[' + array_str + ']'

# Parse as JSON
try:
    questions = json.loads(json_str)
except json.JSONDecodeError as e:
    print(f"JSON decode error: {e}")
    print("Cleaned string around error:")
    lines = json_str.split('\n')
    start = max(0, e.lineno - 5)
    end = min(len(lines), e.lineno + 5)
    for i in range(start, end):
        print(f"{i+1}: {lines[i]}")
    exit(1)

# Generate markdown
markdown = "# IQ Assessment Questions and Answers\n\n"

for i, q in enumerate(questions):
    markdown += f"## Question {i+1}\n\n"
    markdown += f"**Title:** {q.get('title', 'N/A')}\n\n"
    
    # Options
    if 'opts' in q:
        opts = q['opts']
        markdown += "**Options:**\n"
        for j, opt in enumerate(opts):
            markdown += f"- {chr(65+j)}: {opt}\n"
    elif 'imgOpts' in q:
        markdown += "**Options:** A, B, C, D (image options from URLs)\n"
    else:
        markdown += "**Options:** Custom visual options\n"
    
    markdown += "\n"
    
    # Answer
    answer_idx = q.get('answer', -1)
    if answer_idx >= 0:
        answer_letter = chr(65 + answer_idx)
        markdown += f"**Answer:** {answer_letter} ({answer_idx})\n\n"
    else:
        markdown += "**Answer:** N/A\n\n"
    
    # Solving Logic
    exp = q.get('exp', 'N/A')
    markdown += f"**Solving Logic:** {exp}\n\n"
    
    markdown += "---\n\n"

# Write to file
with open('question_answer_sheet.md', 'w', encoding='utf-8') as f:
    f.write(markdown)

print("Generated question_answer_sheet.md")