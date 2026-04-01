
import re

target = "frontend/static/iq_assessment.js"
with open(target, "r", encoding="utf-8") as f:
    content = f.read()

# ── Q21 ─────────────────────────────────────────────────────────────────────
q21 = """    ,
    {
        title: 'Choose the number that is 1/4 of 1/2 of 1/5 of 200:',
        source: 'Quantitative Reasoning',
        opts: ['2', '5', '10', '25', '50'],
        answer: 1, time: 90, exp: '1/5 of 200 = 40. 1/2 of 40 = 20. 1/4 of 20 = 5.'
    },"""

# ── Q22 ─────────────────────────────────────────────────────────────────────
q22 = """
    {
        title: 'Which larger shape would be made if the two sections are fitted together?',
        source: 'Perceptual Reasoning',
        customHtml: '<div style="display:flex;gap:12px;align-items:flex-end;justify-content:center;margin-top:20px;"><div style="display:grid;grid-template-columns:30px 30px;grid-template-rows:30px 30px;border:1px solid #777;background:#fff;"><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#009944;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div></div><div style="display:grid;grid-template-columns:30px 30px 30px;grid-template-rows:30px 30px 30px;border:1px solid #777;background:#fff;"><div style="background:#009944;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div><div style="grid-column:2/span 2;grid-row:2/span 2;background:#fff;border:1px solid #777;"></div></div></div>',
        customOptsHtml: ['<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #777;background:#fff;"><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#009944;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#009944;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div></div>', '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #777;background:#fff;"><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#009944;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#009944;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#009944;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div></div>', '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #777;background:#fff;"><div style="background:#009944;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#009944;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div></div>', '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #777;background:#fff;"><div style="background:#fff;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#009944;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#009944;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#00004d;border:1px solid #777;"></div></div>'],
        answer: 0, time: 90, exp: 'The pieces combine and rotate to fit a 3x3 grid.'
    },"""

# ── Q23 ─────────────────────────────────────────────────────────────────────
q23 = """
    {
        title: 'If all Bloops are Razzies and all Razzies are Lazzies, all Bloops are definitely Lazzies.',
        source: 'Fluid Reasoning',
        opts: ['True', 'False'],
        answer: 0, time: 90, exp: 'Because Bloops are a subset of Razzies, and Razzies are a subset of Lazzies, Bloops are necessarily Lazzies.'
    },"""

# ── Q24 ─────────────────────────────────────────────────────────────────────
q24 = """
    {
        title: 'John needs 13 bottles of water from the store. John can only carry 3 at a time. What is the minimum number of trips John needs to make?',
        source: 'Quantitative Reasoning',
        opts: ['3', '4', '4 1/2', '5', '6'],
        answer: 3, time: 90, exp: '13 divided by 3 is 4 remainder 1. So 4 trips is not enough; he needs a 5th trip. Answer: 5.'
    },"""

# ── Q25 ─────────────────────────────────────────────────────────────────────
q25 = """
    {
        title: 'Which one of the numbers does not belong? 1, 2, 5, 10, 13, 26, 29, 48',
        source: 'Fluid Reasoning',
        opts: ['1', '5', '26', '29', '48'],
        answer: 4, time: 90, exp: 'The sequence alternates x2 and +3. 29x2=58, not 48. So 48 does not belong.'
    },"""

# ── Q26 ─────────────────────────────────────────────────────────────────────
q26 = """
    {
        title: 'Ralph likes 25 but not 24; he likes 400 but not 300; he likes 144 but not 145. Which does he like?',
        source: 'Fluid Reasoning',
        opts: ['10', '50', '124', '200', '1600'],
        answer: 4, time: 90, exp: 'Ralph only likes perfect squares. 1600 = 40x40.'
    },"""

# ── Q27 ─────────────────────────────────────────────────────────────────────
q27 = """
    {
        title: 'How many four-sided figures appear in the diagram below?',
        source: 'Perceptual Reasoning',
        customHtml: '<div style="position:relative;width:180px;height:180px;margin:20px auto;background:#fff;border-radius:4px;"><svg width="180" height="180"><rect x="10" y="10" width="160" height="160" fill="none" stroke="#222" stroke-width="2"/><rect x="10" y="10" width="80" height="80" fill="none" stroke="#222" stroke-width="2"/><rect x="90" y="10" width="80" height="80" fill="none" stroke="#222" stroke-width="2"/><rect x="10" y="90" width="80" height="80" fill="none" stroke="#222" stroke-width="2"/><rect x="90" y="90" width="80" height="80" fill="none" stroke="#222" stroke-width="2"/><line x1="10" y1="90" x2="170" y2="90" stroke="#222" stroke-width="2"/><line x1="90" y1="10" x2="90" y2="170" stroke="#222" stroke-width="2"/></svg></div>',
        opts: ['10', '16', '22', '25', '28'],
        answer: 1, time: 90, exp: 'By counting all overlapping rectangles systematically: 4 small + 4 medium + 4 cross + 1 large + 3 L-shapes = 16.'
    },"""

# ── Q28 ─────────────────────────────────────────────────────────────────────
q28 = """
    {
        title: 'How many squares are there in the picture?',
        source: 'Spatial Reasoning',
        customHtml: '<div style="display:flex;flex-direction:column;align-items:center;background:#fff;padding:20px;border-radius:8px;"><div style="width:80px;height:40px;border:2px solid #142e56;border-bottom:none;"></div><div style="display:flex;"><div style="width:40px;height:80px;border:2px solid #142e56;border-right:none;"></div><div style="display:grid;grid-template-columns:40px 40px;grid-template-rows:40px 40px;border:2px solid #142e56;"><div style="border-right:2px solid #142e56;border-bottom:2px solid #142e56;"></div><div style="border-bottom:2px solid #142e56;"></div><div style="border-right:2px solid #142e56;"></div><div></div></div><div style="width:40px;height:80px;border:2px solid #142e56;border-left:none;"></div></div><div style="width:80px;height:40px;border:2px solid #142e56;border-top:none;"></div></div>',
        customOptsHtml: ['<svg width="50" height="50" viewBox="0 0 60 60"><rect x="2" y="2" width="56" height="56" fill="none" stroke="#142e56" stroke-width="2"/><circle cx="30" cy="30" r="22" fill="none" stroke="#142e56" stroke-width="2"/><text x="30" y="40" text-anchor="middle" font-size="24" font-weight="bold" fill="#142e56">10</text></svg>', '<svg width="50" height="50" viewBox="0 0 60 60"><rect x="2" y="2" width="56" height="56" fill="none" stroke="#142e56" stroke-width="2"/><circle cx="30" cy="30" r="22" fill="none" stroke="#142e56" stroke-width="2"/><text x="30" y="40" text-anchor="middle" font-size="24" font-weight="bold" fill="#142e56">5</text></svg>', '<svg width="50" height="50" viewBox="0 0 60 60"><rect x="2" y="2" width="56" height="56" fill="none" stroke="#142e56" stroke-width="2"/><circle cx="30" cy="30" r="22" fill="none" stroke="#142e56" stroke-width="2"/><text x="30" y="40" text-anchor="middle" font-size="24" font-weight="bold" fill="#142e56">11</text></svg>', '<svg width="50" height="50" viewBox="0 0 60 60"><rect x="2" y="2" width="56" height="56" fill="none" stroke="#142e56" stroke-width="2"/><circle cx="30" cy="30" r="22" fill="none" stroke="#142e56" stroke-width="2"/><text x="30" y="40" text-anchor="middle" font-size="24" font-weight="bold" fill="#142e56">8</text></svg>', '<svg width="50" height="50" viewBox="0 0 60 60"><rect x="2" y="2" width="56" height="56" fill="none" stroke="#142e56" stroke-width="2"/><circle cx="30" cy="30" r="22" fill="none" stroke="#142e56" stroke-width="2"/><text x="30" y="40" text-anchor="middle" font-size="24" font-weight="bold" fill="#142e56">7</text></svg>', '<svg width="50" height="50" viewBox="0 0 60 60"><rect x="2" y="2" width="56" height="56" fill="none" stroke="#142e56" stroke-width="2"/><circle cx="30" cy="30" r="22" fill="none" stroke="#142e56" stroke-width="2"/><text x="30" y="40" text-anchor="middle" font-size="24" font-weight="bold" fill="#142e56">6</text></svg>'],
        answer: 2, time: 90, exp: 'There are 11 squares total including all different sizes.'
    },"""

# ── Q29 ─────────────────────────────────────────────────────────────────────
def mk3(spots, is_q=False):
    if is_q:
        return '<div style="width:58px;height:58px;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;">?</div>'
    h = '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;">'
    for r in range(3):
        for c in range(3):
            bg = '#f59e0b' if (r, c) in spots else '#fff'
            h += f'<div style="background:{bg};border:1.5px solid #142e56;"></div>'
    return h + '</div>'

m1=mk3([(2,0)]); m2=mk3([(1,0),(2,0)]); m3=mk3([(0,0),(1,0),(2,0)])
m4=mk3([(0,1),(1,1),(2,1)]); m5=mk3([(1,1)]); m6=mk3([(0,1),(1,1),(2,1)])
m7=mk3([(2,2)]); m8=mk3([(1,2),(2,2)]); m9=mk3([],True)
oA=mk3([(1,0),(1,1),(1,2)]); oB=mk3([(0,2),(1,2),(2,2)])
oC=mk3([(0,1),(1,1),(2,1)]); oD=mk3([(0,2),(1,2)])
oE=mk3([(0,0),(1,1),(2,2)]); oF=mk3([(1,0),(1,1),(1,2)])

q29 = f"""
    {{
        title: 'Select the missing matrix:',
        source: 'Perceptual Pattern',
        customHtml: '<div style="display:grid;grid-template-columns:auto auto auto;gap:15px;background:#fff;padding:20px;border-radius:8px;justify-content:center;">{m1}{m2}{m3}{m4}{m5}{m6}{m7}{m8}{m9}</div>',
        customOptsHtml: ['{oA}', '{oB}', '{oC}', '{oD}', '{oE}', '{oF}'],
        answer: 1, time: 90, exp: 'Right column builds from bottom up: 1 dot at bottom, then 2, then 3.'
    }},"""

# ── Q30 ─────────────────────────────────────────────────────────────────────
q30 = """
    {
        title: 'Which word is the odd one out? Spool / Drawer / Looter / Pans',
        source: 'Verbal Reasoning',
        opts: ['Spool', 'Drawer', 'Looter', 'Pans'],
        answer: 3, time: 90, exp: 'Spool=Loops, Drawer=Reward, Looter=Retool reversed. Pans reversed is Snap, not a meaningful reversal in this set.'
    },"""

# ── Q31 ─────────────────────────────────────────────────────────────────────
def make_circ(angle):
    if angle is None:
        return '<div style="width:54px;height:54px;border-radius:50%;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">?</div>'
    return f'<div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate({angle}deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div>'

c_cells = [make_circ(180), make_circ(270), make_circ(0), make_circ(315), make_circ(135), make_circ(135), make_circ(135), make_circ(225), make_circ(None)]
grid31 = '<div style="display:grid;grid-template-columns:60px 60px 60px;gap:20px;justify-content:center;margin:20px auto;">' + ''.join(c_cells) + '</div>'
opts31 = [make_circ(45), make_circ(135), make_circ(90), make_circ(225), make_circ(270), make_circ(315)]

q31 = f"""
    {{
        title: 'Select the correct pattern to complete the sequence:',
        source: 'Fluid Reasoning',
        customHtml: '{grid31}',
        customOptsHtml: ['{opts31[0]}', '{opts31[1]}', '{opts31[2]}', '{opts31[3]}', '{opts31[4]}', '{opts31[5]}'],
        answer: 1, time: 90, exp: 'The pointer follows a rotation pattern. The missing cell requires 135 degrees.'
    }},"""

# ── Q32 ─────────────────────────────────────────────────────────────────────
def arrow_cell(direction, count):
    if direction is None:
        return '<div style="width:60px;height:60px;background:#142e56;display:flex;align-items:center;justify-content:center;color:#f59e0b;font-size:32px;font-weight:bold;">?</div>'
    arrows = {'up': '↑', 'down': '↓', 'left': '←', 'right': '→'}
    sym = arrows.get(direction, '?')
    return f'<div style="width:60px;height:60px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;gap:2px;background:#fff;font-size:22px;color:#142e56;">{"".join([sym]*count)}</div>'

row1 = arrow_cell('left',1) + arrow_cell('down',1) + arrow_cell('right',1)
row2 = arrow_cell('down',2) + arrow_cell('right',2) + arrow_cell('left',2)
row3 = arrow_cell('right',3) + arrow_cell('left',3) + arrow_cell(None,0)
grid32 = f'<div style="display:grid;grid-template-columns:60px 60px 60px;border:2px solid #142e56;width:max-content;margin:20px auto;">{row1}{row2}{row3}</div>'
o32 = [arrow_cell('up',3), arrow_cell('down',3), arrow_cell('left',3), arrow_cell('right',3), arrow_cell('up',2), arrow_cell('left',2)]

q32 = f"""
    {{
        title: 'Which box completes the grid?',
        source: 'Perceptual Matrix',
        customHtml: '{grid32}',
        customOptsHtml: ['{o32[0]}', '{o32[1]}', '{o32[2]}', '{o32[3]}', '{o32[4]}', '{o32[5]}'],
        answer: 1, time: 90, exp: 'Each row uses the same direction set (L/D/R, D/R/L, R/L/?). Third row needs Down arrows x3.'
    }},"""

# ── Q33 ─────────────────────────────────────────────────────────────────────
def dot_cell(dots, lines, is_q=False):
    if is_q:
        return '<div style="width:60px;height:60px;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">?</div>'
    h = '<div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;">'
    if lines == 1:
        h += '<div style="position:absolute;top:29px;width:100%;height:2px;background:#142e56;"></div>'
    elif lines == 2:
        h += '<div style="position:absolute;top:19px;width:100%;height:2px;background:#142e56;"></div><div style="position:absolute;top:39px;width:100%;height:2px;background:#142e56;"></div>'
    for _ in range(dots):
        h += '<div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div>'
    return h + '</div>'

g33 = '<div style="display:grid;grid-template-columns:60px 60px 60px;border:2px solid #142e56;width:max-content;margin:20px auto;">'
g33 += dot_cell(1,0) + dot_cell(1,1) + dot_cell(1,2)
g33 += dot_cell(2,0) + dot_cell(2,1) + dot_cell(2,2)
g33 += dot_cell(3,0) + dot_cell(3,1) + dot_cell(0,0,True)
g33 += '</div>'
o33 = [dot_cell(3,2), dot_cell(3,1), dot_cell(4,2), dot_cell(2,2), dot_cell(3,0), dot_cell(2,1)]

q33 = f"""
    {{
        title: 'Which box completes the sequence?',
        source: 'Visual Patterns',
        customHtml: '{g33}',
        customOptsHtml: ['{o33[0]}', '{o33[1]}', '{o33[2]}', '{o33[3]}', '{o33[4]}', '{o33[5]}'],
        answer: 0, time: 90, exp: 'Dots increase 1-2-3 vertically. Lines increase 0-1-2 horizontally. Cell needs 3 dots + 2 lines.'
    }},"""

# ── Q34 ─────────────────────────────────────────────────────────────────────
def jigsaw_opt(lines_svg):
    return f'<svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#FFA500"/><rect y="15" width="60" height="30" fill="#0A1B3F"/><rect y="29" width="60" height="2" fill="#fff"/>{lines_svg}</svg>'

oJA = jigsaw_opt('<line x1="20" y1="0" x2="60" y2="60" stroke="#fff" stroke-width="1.5"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/>')
oJB = jigsaw_opt('<line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/><line x1="40" y1="60" x2="50" y2="0" stroke="#fff" stroke-width="1.5"/><line x1="60" y1="10" x2="10" y2="60" stroke="red" stroke-width="1.5"/><line x1="20" y1="0" x2="60" y2="60" stroke="#fff" stroke-width="1.5"/>')
oJC = jigsaw_opt('<line x1="0" y1="10" x2="60" y2="20" stroke="#fff" stroke-width="1.5"/><line x1="20" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/>')
oJD = jigsaw_opt('<line x1="0" y1="30" x2="60" y2="20" stroke="#fff" stroke-width="1.5"/><line x1="30" y1="60" x2="20" y2="0" stroke="red" stroke-width="1.5"/>')
oJE = jigsaw_opt('<line x1="20" y1="0" x2="60" y2="60" stroke="#fff" stroke-width="1.5"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/><line x1="50" y1="60" x2="20" y2="0" stroke="red" stroke-width="1.5"/>')
oJF = jigsaw_opt('<line x1="20" y1="0" x2="30" y2="60" stroke="#fff" stroke-width="1.5"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/>')

q34 = f"""
    {{
        title: 'Select the missing patch:',
        source: 'Perceptual Patterns',
        customHtml: '<div style="position:relative;width:200px;height:200px;background:#FFA500;overflow:hidden;margin:20px auto;border:2px solid #333;border-radius:4px;"><div style="position:absolute;top:75px;width:100%;height:50px;background:#0A1B3F;"></div><div style="position:absolute;top:99px;width:100%;height:2px;background:#FFF;"></div><svg width="200" height="200" style="position:absolute;top:0;left:0;"><line x1="30" y1="0" x2="80" y2="200" stroke="red" stroke-width="1.5"/><line x1="80" y1="0" x2="120" y2="200" stroke="white" stroke-width="1.5"/><line x1="140" y1="0" x2="60" y2="200" stroke="red" stroke-width="1.5"/><line x1="160" y1="0" x2="100" y2="200" stroke="white" stroke-width="1.5"/></svg><div style="position:absolute;top:60px;left:60px;width:80px;height:80px;background:#FFF;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:bold;color:#0A1B3F;box-shadow:0 0 10px rgba(0,0,0,0.5);">?</div></div>',
        customOptsHtml: ['{oJA}', '{oJB}', '{oJC}', '{oJD}', '{oJE}', '{oJF}'],
        answer: 1, time: 90, exp: 'The patch lines must align with the red and white diagonal lines crossing the puzzle.'
    }},"""

# ── Q35 ─────────────────────────────────────────────────────────────────────
def ms_cell(star, moon, is_q=False):
    if is_q:
        return '<div style="width:54px;height:54px;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">?</div>'
    h = '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #142e56;background:#fff;">'
    for r in range(3):
        for c in range(3):
            content = '★' if (r,c)==star else ('🌙' if (r,c)==moon else '')
            h += f'<div style="border-right:1px solid #142e56;border-bottom:1px solid #142e56;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">{content}</div>'
    return h + '</div>'

sg = '<div style="display:grid;grid-template-columns:54px 54px 54px;gap:15px;width:max-content;margin:20px auto;">'
sg += ms_cell((0,0),(2,2)) + ms_cell((0,1),(1,2)) + ms_cell((0,2),(-1,-1))
sg += ms_cell((1,0),(2,0)) + ms_cell((1,1),(1,1)) + ms_cell((1,2),(0,2))
sg += ms_cell((2,0),(2,0)) + ms_cell((2,1),(1,0)) + ms_cell(None,None,True)
sg += '</div>'
so = [ms_cell((1,2),(0,0)), ms_cell((1,2),(1,1)), ms_cell((1,2),(0,2)), ms_cell((0,2),(0,0)), ms_cell((-1,-1),(2,2)), ms_cell((2,0),(-1,-1))]

q35 = f"""
    {{
        title: 'Complete the pattern of stars and moons:',
        source: 'Perceptual Patterns',
        customHtml: '{sg}',
        customOptsHtml: ['{so[0]}', '{so[1]}', '{so[2]}', '{so[3]}', '{so[4]}', '{so[5]}'],
        answer: 2, time: 90, exp: 'The star moves right each column. The moon moves along a diagonal, disappearing off-edge.'
    }}"""

# ── Inject all 15 questions before the ]; marker ────────────────────────────
all_new = q21 + q22 + q23 + q24 + q25 + q26 + q27 + q28 + q29 + q30 + q31 + q32 + q33 + q34 + q35

# Find the exact closing bracket of QUESTIONS
marker = "];\n\nQUESTIONS = QUESTIONS.slice"
if marker not in content:
    # Try windows line endings
    marker = "];\r\n\r\nQUESTIONS = QUESTIONS.slice"

if marker in content:
    # Replace with injected questions + new slice limit
    new_slice = "QUESTIONS = QUESTIONS.slice(0, 35);"
    content = content.replace(
        marker,
        all_new + "\n];\n\n" + new_slice + "\n//"
    )
    # Remove old slice line (now it's a comment-dangling duplicate)
    content = re.sub(r'QUESTIONS = QUESTIONS\.slice\(0,\s*\d+\);\s*\n//', '', content)
    with open(target, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: injected Q21-35 and updated slice to 35")
else:
    print("ERROR: could not find injection marker")
    print(repr(content[content.find('];')-20:content.find('];')+60]))
