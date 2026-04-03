import re

# Read the markdown file
with open('question_answer_sheet.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Read the JS file to get URLs
with open('frontend/static/iq_assessment.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Extract QUESTIONS array
match = re.search(r'var QUESTIONS = \[([\s\S]*?)\];', js_content)
if not match:
    print("No QUESTIONS found")
    exit(1)

array_str = match.group(1)

# Split into individual question objects
questions = re.findall(r'\{[\s\S]*?\}(?=\s*,|\s*\])', array_str)

updated_content = "# IQ Assessment Questions and Answers\n\n"

for i, q_str in enumerate(questions):
    q_num = i + 1
    # Parse the question
    title_match = re.search(r"title:\s*'([^']*)'", q_str)
    title = title_match.group(1) if title_match else "N/A"

    img_url_match = re.search(r"imgUrl:\s*'([^']*)'", q_str)
    img_url = img_url_match.group(1) if img_url_match else None

    img_opts_match = re.search(r"imgOpts:\s*\[([\s\S]*?)\]", q_str)
    img_opts = []
    if img_opts_match:
        opts_str = img_opts_match.group(1)
        img_opts = re.findall(r"'([^']*)'", opts_str)

    custom_html = 'customHtml:' in q_str
    custom_opts = 'customOptsHtml:' in q_str

    answer_match = re.search(r"answer:\s*(\d+)", q_str)
    answer = int(answer_match.group(1)) if answer_match else -1

    exp_match = re.search(r"exp:\s*'([^']*)'", q_str)
    exp = exp_match.group(1) if exp_match else "N/A"

    # Build the section
    section = f"## Question {q_num}\n**Title:** {title}\n"

    if img_url:
        section += f"**Main Image:** ![Main]({img_url})\n"

    if custom_html:
        section += "**Main Visual:** Custom HTML diagram\n"

    section += "**Options:**\n"
    if img_opts:
        for j, url in enumerate(img_opts):
            letter = chr(65 + j)
            section += f"- {letter}: ![{letter}]({url})\n"
    elif custom_opts:
        section += "- A, B, C, D (custom visual options)\n"
    else:
        opts_match = re.search(r"opts:\s*\[([\s\S]*?)\]", q_str)
        if opts_match:
            opts_str = opts_match.group(1)
            opts = re.findall(r"'([^']*)'", opts_str)
            for j, opt in enumerate(opts):
                letter = chr(65 + j)
                section += f"- {letter}: {opt}\n"
        else:
            section += "- N/A\n"

    if answer >= 0:
        letter = chr(65 + answer)
        section += f"**Answer:** {letter} ({answer})\n"
    else:
        section += "**Answer:** N/A\n"

    section += f"**Solving Logic:** {exp}\n\n---\n\n"

    updated_content += section

# Write back
with open('question_answer_sheet.md', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("Updated question_answer_sheet.md with images")