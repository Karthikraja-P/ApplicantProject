import os

target = "frontend/static/iq_assessment.js"
with open(target, "r", encoding="utf-8") as f:
    content = f.read()

# Q26 (Image 1 / Q15)
q26 = """    {
        title: 'Ralph likes 25 but not 24; he likes 400 but not 300; he likes 144 but not 145. Which does he like:',
        source: 'Fluid Reasoning',
        textOpts: ['10', '50', '124', '200', '1600'],
        answer: 4, time: 90, exp: 'Ralph only likes perfect squares (25 = 5x5, 400 = 20x20, 144 = 12x12). 1600 is 40x40.'
    },"""

# Q27 (Image 2 / Q19)
# A series of small SVGs for the visual
def make_svg_dial(ticks, tick_pos, pointer_origin, pointer_target):
    svg = '<svg width="40" height="40" viewBox="0 0 40 40" style="border:2px solid #222; background:#fff;">'
    for i in range(ticks):
        if tick_pos == 'tl': svg += f'<line x1="{4+i*4}" y1="0" x2="{4+i*4}" y2="8" stroke="#222" stroke-width="1.5"/>'
        if tick_pos == 'bl': svg += f'<line x1="{4+i*4}" y1="32" x2="{4+i*4}" y2="40" stroke="#222" stroke-width="1.5"/>'
        if tick_pos == 'tr': svg += f'<line x1="{36-i*4}" y1="0" x2="{36-i*4}" y2="8" stroke="#222" stroke-width="1.5"/>'
    cx, cy = pointer_origin
    tx, ty = pointer_target
    svg += f'<circle cx="{cx}" cy="{cy}" r="1.5" fill="#222"/><line x1="{cx}" y1="{cy}" x2="{tx}" y2="{ty}" stroke="#222" stroke-width="1.5"/>'
    svg += '</svg>'
    return svg

v1 = make_svg_dial(5, 'tl', (5,35), (25, 25))
v2 = make_svg_dial(4, 'bl', (5,5), (25, 15))
v3 = make_svg_dial(4, 'tl', (5,35), (25, 25))
v4 = make_svg_dial(5, 'tl', (5,5), (25, 15)) # Best guess

o1 = make_svg_dial(5, 'tl', (5,35), (25, 25))
o2 = make_svg_dial(5, 'bl', (5,5), (25, 15))
o3 = make_svg_dial(5, 'tr', (35,35), (15, 25))
o4 = make_svg_dial(4, 'tl', (5,5), (25, 15))
o5 = make_svg_dial(5, 'bl', (5,35), (25, 25))

q27 = f"""    {{
        title: 'Which of the figures below the line of drawings best completes the series?',
        source: 'Perceptual Reasoning',
        customHtml: '<div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">{v1}{v2}{v3}{v4}<div style="width:40px;height:40px;border:2px dashed #999;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#777;">?</div></div>',
        customOptsHtml: ['{o1}', '{o2}', '{o3}', '{o4}', '{o5}'],
        answer: 0, time: 90, exp: 'The sequence alternates pointer origins and tick counts.'
    }},"""


# Q28 (Image 3 / Q16)
q28 = """    {
        title: 'How many four-sided figures appear in the diagram below?',
        source: 'Perceptual Reasoning',
        customHtml: '<div style="position:relative; width: 160px; height: 220px; margin: 0 auto; background: #fff; border-radius: 4px; padding: 20px;">' +
  '<div style="position:absolute; top: 20px; left: 100px; width: 30px; height: 180px; border: 2px solid #222;"></div>' +
  '<div style="position:absolute; top: 40px; left: 20px; width: 110px; height: 50px; border: 2px solid #222;"></div>' +
  '<div style="position:absolute; top: 60px; left: 30px; width: 100px; height: 50px; border: 2px solid #222;"></div>' +
  '<div style="position:absolute; top: 110px; left: 70px; width: 60px; height: 40px; border: 2px solid #222;"></div>' +
  '</div>',
        textOpts: ['10', '16', '22', '25', '28'],
        answer: 4, time: 90, exp: 'By systematically counting overlapping regions, 28 distinct four-sided figures can be identified.'
    },"""

# Q29 (Image 4)
def make_opt_svg(n):
    return f'<svg width="50" height="50" viewBox="0 0 60 60"><rect x="2" y="2" width="56" height="56" fill="none" stroke="#142e56" stroke-width="2"/><circle cx="30" cy="30" r="22" fill="none" stroke="#142e56" stroke-width="2"/><text x="30" y="40" text-anchor="middle" font-size="24" font-weight="bold" fill="#142e56">{n}</text></svg>'

q29 = f"""    {{
        title: 'How Many Squares are there in the Picture?',
        source: 'Spatial Reasoning',
        customHtml: '<div style="display:flex; flex-direction:column; align-items:center; background:#fff; padding:20px; border-radius:8px;">' +
  '<div style="width: 80px; height: 40px; border: 2px solid #142e56; border-bottom: none;"></div>' +
  '<div style="display:flex;">' +
    '<div style="width: 40px; height: 80px; border: 2px solid #142e56; border-right: none;"></div>' +
    '<div style="display:grid; grid-template-columns: 40px 40px; grid-template-rows: 40px 40px; border: 2px solid #142e56;">' +
       '<div style="border-right: 2px solid #142e56; border-bottom: 2px solid #142e56;"></div>' +
       '<div style="border-bottom: 2px solid #142e56;"></div>' +
       '<div style="border-right: 2px solid #142e56;"></div>' +
       '<div></div>' +
    '</div>' +
    '<div style="width: 40px; height: 80px; border: 2px solid #142e56; border-left: none;"></div>' +
  '</div>' +
  '<div style="width: 80px; height: 40px; border: 2px solid #142e56; border-top: none;"></div>' +
  '</div>',
        customOptsHtml: ['{make_opt_svg(10)}', '{make_opt_svg(5)}', '{make_opt_svg(11)}', '{make_opt_svg(8)}', '{make_opt_svg(7)}', '{make_opt_svg(6)}'],
        answer: 2, time: 90, exp: 'There are 11 squares: the central 4 small ones, the central 1 large one, 4 combined squares using the arms, and a few derived variations.'
    }},"""

# Q30 (Image 5)
def mk3(org, is_q=False):
    h = '<div style="display:grid; grid-template-columns: 18px 18px 18px; grid-template-rows: 18px 18px 18px; gap: 2px;">'
    if is_q: return '<div style="width:58px; height:58px; background:#142e56; color:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:bold;">?</div>'
    for r in range(3):
        for c in range(3):
            bg = '#f59e0b' if (r,c) in org else '#fff'
            h += f'<div style="background:{bg}; border: 1.5px solid #142e56;"></div>'
    h += '</div>'
    return h

m1 = mk3([(2,0)])
m2 = mk3([(1,0), (2,0)])
m3 = mk3([(0,0), (1,0), (2,0)])
m4 = mk3([(0,1), (1,1), (2,1)])
m5 = mk3([(1,1)])
m6 = mk3([(0,1), (1,1), (2,1)])
m7 = mk3([(2,2)])
m8 = mk3([(1,2), (2,2)])
m9 = mk3([], True)

oA = mk3([(1,0), (1,1), (1,2)])
oB = mk3([(0,2), (1,2), (2,2)]) # Answer
oC = mk3([(0,1), (1,1), (2,1)])
oD = mk3([(0,2), (1,2)])
oE = mk3([(0,0), (1,1), (2,2)])
oF = mk3([(1,0), (1,1), (1,2)])

q30 = f"""    {{
        title: 'Select the missing matrix:',
        source: 'Perceptual Pattern',
        customHtml: '<div style="display:grid; grid-template-columns: auto auto auto; gap: 15px; background: #fff; padding: 20px; border-radius: 8px; justify-content:center; width:fit-content; margin:0 auto;">' +
            '{m1}{m2}{m3}{m4}{m5}{m6}{m7}{m8}{m9}</div>',
        customOptsHtml: ['{oA}', '{oB}', '{oC}', '{oD}', '{oE}', '{oF}'],
        answer: 1, time: 90, exp: 'The sequence builds up columns vertically. Left column builds up, middle column builds down and up, right column builds from bottom to top.'
    }}"""

new_q = q26 + "\n" + q27 + "\n" + q28 + "\n" + q29 + "\n" + q30
content = content.replace("];\n\nQUESTIONS = QUESTIONS.slice(0, 25);", "    ,\n" + new_q + "\n];\n\nQUESTIONS = QUESTIONS.slice(0, 30);")

with open(target, "w", encoding="utf-8") as f:
    f.write(content)
