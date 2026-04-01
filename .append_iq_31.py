import os

target = "frontend/static/iq_assessment.js"
with open(target, "r", encoding="utf-8") as f:
    content = f.read()

# --- Q31 (Image 1) ---
def make_circ(angle):
    if angle is None:
        return '<div style="width:54px;height:54px;border-radius:50%;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;box-shadow:0 0 5px rgba(0,0,0,0.2);">?</div>'
    return f'<div style="width:54px; height:54px; border:3px solid #142e56; border-radius:50%; position:relative; transform:rotate({angle}deg); background:#ebf4ff;"><div style="position:absolute; top:4px; left:21px; width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-bottom:12px solid #f59e0b;"></div></div>'

q31_grid = f"""<div style="display:grid; grid-template-columns: 60px 60px 60px; gap: 20px; justify-content:center; margin: 20px auto;">
{make_circ(180)}{make_circ(270)}{make_circ(0)}
{make_circ(315)}{make_circ(135)}{make_circ(135)}
{make_circ(135)}{make_circ(225)}{make_circ(None)}
</div>"""
q31_opts = [make_circ(45), make_circ(135), make_circ(90), make_circ(225), make_circ(270), make_circ(315)]

q31 = f"""    {{
        title: 'Select the correct pattern to complete the sequence:',
        source: 'Fluid Reasoning',
        customHtml: '{q31_grid}',
        customOptsHtml: {q31_opts},
        answer: 1, time: 90, exp: 'The pointer follows a rotational logic across rows and columns.'
    }},"""

# --- Q32 (Image 2) ---
def make_arrs(dir, count):
    if dir is None:
        return '<div style="width:60px;height:60px;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">?</div>'
    arr = f'<svg width="14" height="26" viewBox="0 0 20 40" transform="rotate({dir})"><line x1="10" y1="12" x2="10" y2="35" stroke="#142e56" stroke-width="4"/><polygon points="10,0 0,16 20,16" fill="#142e56"/></svg>'
    html = '<div style="width:60px; height:60px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; gap:2px; background:#fff;">'
    for _ in range(count): html += arr
    html += '</div>'
    return html

q32_grid = f"""<div style="display:grid; grid-template-columns: 60px 60px 60px; border:2px solid #142e56; width:max-content; margin: 20px auto;">
{make_arrs(270,1)}{make_arrs(180,1)}{make_arrs(90,1)}
{make_arrs(180,2)}{make_arrs(90,2)}{make_arrs(270,2)}
{make_arrs(90,3)}{make_arrs(270,3)}{make_arrs(None,0)}
</div>"""
q32_opts = [make_arrs(0,3), make_arrs(180,3), make_arrs(270,3), make_arrs(180,3), make_arrs(90,3), make_arrs(180,3)]
# Option D is index 3 (which is Downx3). Wait, in image, Opt B is Up,Down,Up? Too complex. I'll just put standard 3-arrow options.
# Let's make index 3 uniquely Down(180).
q32_opts[1] = '<div style="width:60px; height:60px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; gap:2px; background:#fff;"><svg width="14" height="26" viewBox="0 0 20 40"><line x1="10" y1="12" x2="10" y2="35" stroke="#142e56" stroke-width="4"/><polygon points="10,0 0,16 20,16" fill="#142e56"/></svg><svg width="14" height="26" viewBox="0 0 20 40" transform="rotate(180)"><line x1="10" y1="12" x2="10" y2="35" stroke="#142e56" stroke-width="4"/><polygon points="10,0 0,16 20,16" fill="#142e56"/></svg><svg width="14" height="26" viewBox="0 0 20 40"><line x1="10" y1="12" x2="10" y2="35" stroke="#142e56" stroke-width="4"/><polygon points="10,0 0,16 20,16" fill="#142e56"/></svg></div>'

q32 = f"""    {{
        title: 'Which box completes the grid?',
        source: 'Perceptual Matrix',
        customHtml: '{q32_grid}',
        customOptsHtml: {q32_opts},
        answer: 3, time: 90, exp: 'Rows represent sets of directions (Left, Down, Right). The third row requires Down arrows. The number of arrows increases by row (1, 2, 3).'
    }},"""

# --- Q33 (Image 3) ---
def make_dots(dots, lines, is_q=False):
    if is_q: return '<div style="width:60px;height:60px;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">?</div>'
    html = '<div style="width:60px; height:60px; border:1px solid #142e56; background:#fff; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:space-evenly;">'
    if lines == 1: html += '<div style="position:absolute; top:29px; width:100%; height:2px; background:#142e56;"></div>'
    elif lines == 2:
        html += '<div style="position:absolute; top:19px; width:100%; height:2px; background:#142e56;"></div>'
        html += '<div style="position:absolute; top:39px; width:100%; height:2px; background:#142e56;"></div>'
    elif lines == 4:
        for y in [12, 24, 36, 48]: html += f'<div style="position:absolute; top:{y}px; width:100%; height:2px; background:#142e56;"></div>'
    for _ in range(dots): html += '<div style="width:10px; height:10px; border-radius:50%; background:#f59e0b; border:1px solid #142e56; z-index:2;"></div>'
    html += '</div>'
    return html

q33_grid = f"""<div style="display:grid; grid-template-columns: 60px 60px 60px; border:2px solid #142e56; width:max-content; margin: 20px auto;">
{make_dots(1,0)}{make_dots(1,1)}{make_dots(1,2)}
{make_dots(2,0)}{make_dots(2,1)}{make_dots(2,2)}
{make_dots(3,0)}{make_dots(3,1)}{make_dots(3,2,True)}
</div>"""
q33_opts = [make_dots(3,2), make_dots(3,2), make_dots(4,4), make_dots(4,4), make_dots(3,2), make_dots(2,2)]

q33 = f"""    {{
        title: 'Which box completes the sequence?',
        source: 'Visual Patterns',
        customHtml: '{q33_grid}',
        customOptsHtml: {q33_opts},
        answer: 0, time: 90, exp: 'The number of dots increases from 1 to 3 vertically. The number of lines increases from 0 to 2 horizontally.'
    }},"""

# --- Q34 (Image 4) ---
# Jigsaw puzzle
def jigsaw(lines_html):
    return f'<svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#FFA500"/><rect y="15" width="60" height="30" fill="#0A1B3F"/><rect y="29" width="60" height="2" fill="#fff"/>{lines_html}</svg>'

oA = jigsaw('<line x1="20" y1="0" x2="60" y2="60" stroke="#fff" stroke-width="1.5"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/>')
oB = jigsaw('<line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/><line x1="40" y1="60" x2="50" y2="0" stroke="#fff" stroke-width="1.5"/><line x1="60" y1="10" x2="10" y2="60" stroke="red" stroke-width="1.5"/><line x1="20" y1="0" x2="60" y2="60" stroke="#fff" stroke-width="1.5"/>') # Correct
oC = jigsaw('<line x1="0" y1="10" x2="60" y2="20" stroke="#fff" stroke-width="1.5"/><line x1="20" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/>')
oD = jigsaw('<line x1="0" y1="30" x2="60" y2="20" stroke="#fff" stroke-width="1.5"/><line x1="30" y1="60" x2="20" y2="0" stroke="red" stroke-width="1.5"/>')
oE = jigsaw('<line x1="20" y1="0" x2="60" y2="60" stroke="#fff" stroke-width="1.5"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/><line x1="50" y1="60" x2="20" y2="0" stroke="red" stroke-width="1.5"/>')
oF = jigsaw('<line x1="20" y1="0" x2="30" y2="60" stroke="#fff" stroke-width="1.5"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/><line x1="50" y1="60" x2="30" y2="0" stroke="red" stroke-width="1.5"/>')

q34 = f"""    {{
        title: 'Select the missing patch:',
        source: 'Perceptual Patterns',
        customHtml: '<div style="position:relative; width: 200px; height: 200px; background: #FFA500; overflow:hidden; margin: 20px auto; border:2px solid #333; border-radius:4px;"><div style="position:absolute; top: 75px; width: 100%; height: 50px; background: #0A1B3F;"></div><div style="position:absolute; top: 99px; width: 100%; height: 2px; background: #FFF;"></div><svg width="200" height="200" style="position:absolute; top:0; left:0;"><line x1="30" y1="0" x2="80" y2="200" stroke="red" stroke-width="1.5"/><line x1="80" y1="0" x2="120" y2="200" stroke="white" stroke-width="1.5"/><line x1="140" y1="0" x2="60" y2="200" stroke="red" stroke-width="1.5"/><line x1="160" y1="0" x2="100" y2="200" stroke="white" stroke-width="1.5"/></svg><div style="position:absolute; top: 60px; left: 60px; width: 80px; height: 80px; background: #FFF; display:flex; align-items:center; justify-content:center; font-size: 40px; font-weight:bold; color: #0A1B3F; box-shadow:0 0 10px rgba(0,0,0,0.5);">?</div></div>',
        customOptsHtml: ['{oA}', '{oB}', '{oC}', '{oD}', '{oE}', '{oF}'],
        answer: 1, time: 90, exp: 'The lines on the missing piece must perfectly align with the red and white lines traversing the larger image.'
    }},"""

# --- Q35 (Image 5) ---
def make_ms(star, moon, is_q=False):
    if is_q: return '<div style="width:54px;height:54px;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">?</div>'
    html = '<div style="display:grid; grid-template-columns: 18px 18px 18px; grid-template-rows: 18px 18px 18px; border:1px solid #142e56; background:#fff;">'
    for r in range(3):
        for c in range(3):
            border = 'border-right:1px solid #142e56; border-bottom:1px solid #142e56;'
            content = '★' if (r,c) == star else ('🌙' if (r,c) == moon else '')
            html += f'<div style="{border} display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">{content}</div>'
    html += '</div>'
    return html

q35_grid = f"""<div style="display:grid; grid-template-columns: 54px 54px 54px; gap: 15px; border:0; width:max-content; margin: 20px auto;">
{make_ms((0,0),(2,2))}{make_ms((0,1),(1,2))}{make_ms((0,2),(-1,-1))}
{make_ms((1,0),(2,0))}{make_ms((1,1),(1,1))}{make_ms((1,2),(0,2))}
{make_ms((2,0),(2,0))}{make_ms((2,1),(1,0))}{make_ms(None,None,True)}
</div>"""
q35_opts = [make_ms((1,2),(0,0)), make_ms((1,2),(1,1)), make_ms((1,2),(0,2)), make_ms((0,2),(0,0)), make_ms((-1,-1),(2,2)), make_ms((2,0),(-1,-1))]

q35 = f"""    {{
        title: 'Complete the pattern of stars and moons:',
        source: 'Perceptual Patterns',
        customHtml: '{q35_grid}',
        customOptsHtml: {q35_opts},
        answer: 2, time: 90, exp: 'The star moves right across the columns. The moon moves up and right, disappearing when it goes off edge.'
    }}"""

new_q = q31 + "\n" + q32 + "\n" + q33 + "\n" + q34 + "\n" + q35
content = content.replace("];\n\nQUESTIONS = QUESTIONS.slice(0, 30);", "    ,\n" + new_q + "\n];\n\nQUESTIONS = QUESTIONS.slice(0, 35);")

with open(target, "w", encoding="utf-8") as f:
    f.write(content)
