import re

target = "frontend/static/iq_assessment.js"
with open(target, "r", encoding="utf-8") as f:
    content = f.read()

# --- Q32 Fix (Stacked Vectors) ---
def make_arrs_exact(dirs):
    if dirs is None:
        return '<div style="width:80px;height:80px;border:2px solid #142e56;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;">?</div>'
    
    is_hz = dirs[0] in [90, 270]
    flex_dir = 'column' if is_hz else 'row'
    
    html = f'<div style="width:80px; height:80px; border:2px solid #142e56; display:flex; align-items:center; justify-content:center; gap:6px; background:#fff; flex-direction:{flex_dir}; padding:4px; box-sizing:border-box;">'
    for d in dirs:
        html += f'<svg width="18" height="40" viewBox="0 0 20 40" transform="rotate({d})"><rect x="8" y="14" width="4" height="26" fill="#142e56"/><polygon points="10,0 2,16 18,16" fill="#142e56"/></svg>'
    html += '</div>'
    return html

q32_grid = f"""<div style="display:grid; grid-template-columns: 80px 80px 80px; width:max-content; margin: 20px auto; border: 2px solid #142e56;">
<div style="margin:-1px;">{make_arrs_exact([270])}</div><div style="margin:-1px;">{make_arrs_exact([180])}</div><div style="margin:-1px;">{make_arrs_exact([90])}</div>
<div style="margin:-1px;">{make_arrs_exact([180,180])}</div><div style="margin:-1px;">{make_arrs_exact([90,90])}</div><div style="margin:-1px;">{make_arrs_exact([270,270])}</div>
<div style="margin:-1px;">{make_arrs_exact([90,90,90])}</div><div style="margin:-1px;">{make_arrs_exact([270,270,270])}</div><div style="margin:-1px;">{make_arrs_exact(None)}</div>
</div>"""

q32_opts = [
    make_arrs_exact([0,0,0]),
    make_arrs_exact([0,180,0]),
    make_arrs_exact([270,270,270]),
    make_arrs_exact([180,180,180]),
    make_arrs_exact([90,90,90]),
    make_arrs_exact([180,0,180])
]
q32_opts_str = "['" + "', '".join(q32_opts) + "']"

# --- Q34 Fix (Jigsaw Intersections) ---
def extrapolate(x1, y1, x2, y2):
    pts = []
    dy = y2 - y1
    dx = x2 - x1
    if dy != 0:
        pts.append((x1 + (0 - y1) / dy * dx, 0))
        pts.append((x1 + (240 - y1) / dy * dx, 240))
    if dx != 0:
        pts.append((0, y1 + (0 - x1) / dx * dy))
        pts.append((240, y1 + (240 - x1) / dx * dy))
    
    valid = []
    for (px, py) in pts:
        if -0.1 <= px <= 240.1 and -0.1 <= py <= 240.1:
            valid.append((px, py))
    return valid[0][0], valid[0][1], valid[1][0], valid[1][1] if len(valid) >= 2 else (x1, y1, x2, y2)

lines_ext = [
    ("red", extrapolate(80, 100, 120, 160)),
    ("white", extrapolate(100, 80, 160, 150)),
    ("red", extrapolate(130, 80, 110, 160)),
    ("white", extrapolate(150, 80, 130, 160))
]
q34_main_lines = ""
for color, (ax, ay, bx, by) in lines_ext:
    q34_main_lines += f'<line x1="{ax}" y1="{ay}" x2="{bx}" y2="{by}" stroke="{color}" stroke-width="2"/>'

q34_grid = f'<div style="position:relative; width: 240px; height: 240px; background: #FFA500; overflow:hidden; margin: 20px auto; border:2px solid #ccc; box-shadow:0 0 5px rgba(0,0,0,0.2); border-radius:4px;"><div style="position:absolute; top: 90px; width: 100%; height: 60px; background: #0A1B3F;"></div><div style="position:absolute; top: 119px; width: 100%; height: 2px; background: #FFF;"></div><svg width="240" height="240" style="position:absolute; top:0; left:0;">{q34_main_lines}</svg><div style="position:absolute; top: 80px; left: 80px; width: 80px; height: 80px; background: #FFF; display:flex; align-items:center; justify-content:center; font-size: 50px; font-weight:bold; color: #0A1B3F; box-shadow:0 0 10px rgba(0,0,0,0.5);">?</div></div>'

def make_opt(letter):
    base = '<svg width="80" height="80" viewBox="0 0 80 80" style="background:#FFA500; border:2px solid #142e56; box-sizing:border-box;"><rect y="10" width="80" height="60" fill="#0A1B3F"/><rect y="39" width="80" height="2" fill="#fff"/>'
    
    if letter == 'B': # Perfect match
        l = '<line x1="0" y1="20" x2="40" y2="80" stroke="red" stroke-width="2"/><line x1="20" y1="0" x2="80" y2="70" stroke="#fff" stroke-width="2"/><line x1="50" y1="0" x2="30" y2="80" stroke="red" stroke-width="2"/><line x1="70" y1="0" x2="50" y2="80" stroke="#fff" stroke-width="2"/>'
    elif letter == 'A':
        l = '<line x1="20" y1="0" x2="60" y2="80" stroke="#fff" stroke-width="2"/><line x1="10" y1="80" x2="30" y2="0" stroke="red" stroke-width="2"/>'
    elif letter == 'C':
        l = '<line x1="0" y1="20" x2="80" y2="30" stroke="#fff" stroke-width="2"/><line x1="30" y1="80" x2="50" y2="0" stroke="red" stroke-width="2"/>'
    elif letter == 'D':
        l = '<line x1="0" y1="40" x2="80" y2="20" stroke="#fff" stroke-width="2"/><line x1="40" y1="80" x2="30" y2="0" stroke="red" stroke-width="2"/>'
    elif letter == 'E':
        l = '<line x1="20" y1="0" x2="80" y2="80" stroke="#fff" stroke-width="2"/><line x1="10" y1="80" x2="50" y2="0" stroke="red" stroke-width="2"/><line x1="70" y1="80" x2="30" y2="0" stroke="red" stroke-width="2"/>'
    else: # F
        l = '<line x1="30" y1="0" x2="40" y2="80" stroke="#fff" stroke-width="2"/><line x1="10" y1="80" x2="50" y2="0" stroke="red" stroke-width="2"/><line x1="70" y1="80" x2="40" y2="0" stroke="red" stroke-width="2"/>'
    return base + l + '</svg>'

q34_opts = [make_opt(letter) for letter in ['A', 'B', 'C', 'D', 'E', 'F']]
q34_opts_str = "['" + "', '".join(q34_opts) + "']"

new_q32_grid = q32_grid.replace('\n', '')
new_q34_grid = q34_grid.replace('\n', '')

# We regex replace in the file, pinpointing the specific questions!
pattern_q32_html = r"(title:\s*'Which box completes the grid?',\s*source:\s*'Perceptual Matrix',\s*customHtml:\s*)'.*?'"
pattern_q32_opts = r"(title:\s*'Which box completes the grid?',\s*source:\s*'Perceptual Matrix',\s*customHtml:\s*'.*?',\s*customOptsHtml:\s*)\[.*?\]"

content = re.sub(pattern_q32_html, r"\1'" + new_q32_grid + "'", content, flags=re.DOTALL)
content = re.sub(pattern_q32_opts, r"\1" + q32_opts_str, content, flags=re.DOTALL)

pattern_q34_html = r"(title:\s*'Select the missing patch:',\s*source:\s*'Perceptual Patterns',\s*customHtml:\s*)'.*?'"
pattern_q34_opts = r"(title:\s*'Select the missing patch:',\s*source:\s*'Perceptual Patterns',\s*customHtml:\s*'.*?',\s*customOptsHtml:\s*)\[.*?\]"

content = re.sub(pattern_q34_html, r"\1'" + new_q34_grid + "'", content, flags=re.DOTALL)
content = re.sub(pattern_q34_opts, r"\1" + q34_opts_str, content, flags=re.DOTALL)

with open(target, "w", encoding="utf-8") as f:
    f.write(content)
