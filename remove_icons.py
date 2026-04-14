import re

path = 'frontend/public/index.html'
with open(path, 'r') as f:
    content = f.read()

# Remove <span class="help-icon" ...>ⓘ</span>
# Handles multi-line spans
pattern = re.compile(r'<span\s+class="help-icon"[^>]*>ⓘ</span>', re.DOTALL)
new_content = pattern.sub('', content)

with open(path, 'w') as f:
    f.write(new_content)

print("Removed all help-icons from index.html")
