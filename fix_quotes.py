import re

target = "frontend/static/iq_assessment.js"
with open(target, "r", encoding="utf-8") as f:
    content = f.read()

def replace_newlines(match):
    s = match.group(1)
    s = s.replace('\n', '')
    return "customHtml: '" + s + "',"

new_content = re.sub(r"customHtml:\s*'(.*?)',", replace_newlines, content, flags=re.DOTALL)

with open(target, "w", encoding="utf-8") as f:
    f.write(new_content)
