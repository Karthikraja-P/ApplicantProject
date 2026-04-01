import re

js_file = r"frontend\static\iq_assessment.js"
with open(js_file, "r", encoding="utf-8") as f:
    content = f.read()

# I want to inject a conditional styling in the isImg block inside renderQuestion
# The line currently is:
# btn.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><img src="' + url + '" style="width:100%;height:100%;max-width:64px;max-height:64px;object-fit:contain;border-radius:6px;background:#e2e8f0;padding:4px;" /></div>' + '<div class="opt-label" style="text-align:center;">' + label + '</div>';

original_line = """btn.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><img src="' + url + '" style="width:100%;height:100%;max-width:64px;max-height:64px;object-fit:contain;border-radius:6px;background:#e2e8f0;padding:4px;" /></div>' + '<div class="opt-label" style="text-align:center;">' + label + '</div>';"""

new_line = """var extraStyle = (idx === 3 && (i === 0 || i === 2)) ? "filter: brightness(0.6) contrast(200%); mix-blend-mode: multiply;" : "";
                btn.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><img src="' + url + '" style="width:100%;height:100%;max-width:64px;max-height:64px;object-fit:contain;border-radius:6px;background:#e2e8f0;padding:4px;' + extraStyle + '" /></div>' + '<div class="opt-label" style="text-align:center;">' + label + '</div>';"""

if original_line in content:
    content = content.replace(original_line, new_line)
    with open(js_file, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched iq_assessment.js successfully.")
else:
    print("Could not find line to patch.")
