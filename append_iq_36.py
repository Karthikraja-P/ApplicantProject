import re

def mk36(o, i, c):
    so = {"t":"", "r":"", "b":"", "l":""}
    for x in o: so[x] = "border-top:3px solid #142e56; " if x=='t' else "border-right:3px solid #142e56; " if x=='r' else "border-bottom:3px solid #142e56; " if x=='b' else "border-left:3px solid #142e56; "
    si = {"t":"", "r":"", "b":"", "l":""}
    for x in i: si[x] = "border-top:3px solid #142e56; " if x=='t' else "border-right:3px solid #142e56; " if x=='r' else "border-bottom:3px solid #142e56; " if x=='b' else "border-left:3px solid #142e56; "
    c_div = '<div style="width:16px; height:16px; background:#142e56;"></div>' if c=='bs' else '<div style="width:16px; height:16px; border:2px solid #142e56; box-sizing:border-box;"></div>' if c=='bh' else '<div style="width:16px; height:16px; background:#f59e0b;"></div>' if c=='os' else '<div style="width:16px; height:16px;"></div>' if c=='' else '<div style="width:100%;height:100%;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">?</div>'
    if c == '?':
        return '<div style="width:60px; height:60px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; background:#142e56; color:#f59e0b; font-size:32px; font-weight:bold;">?</div>'
    return f'<div style="width:60px; height:60px; {"".join(so.values())} box-sizing:border-box; display:flex; align-items:center; justify-content:center;"><div style="width:40px; height:40px; {"".join(si.values())} box-sizing:border-box; display:flex; align-items:center; justify-content:center;">{c_div}</div></div>'

q36_h = f'<div style="display:grid; grid-template-columns: 60px 60px 60px; gap: 20px; justify-content:center; margin: 20px auto;">{mk36("tl","bl","bs")}{mk36("tl","tr","bh")}{mk36("tr","br","os")}{mk36("tl","tr","bh")}{mk36("tr","br","os")}{mk36("tr","br","bs")}{mk36("bl","bl","os")}{mk36("tl","tr","bs")}{mk36("","","?")}</div>'.replace("\\n", "")
q36_o = f"['{mk36('tl','tl','os')}', '{mk36('tl','tl','bs')}', '{mk36('tl','br','bs')}', '{mk36('bl','bl','bh')}', '{mk36('tl','br','os')}', '{mk36('tl','tr','bh')}']".replace("\\n", "")

def mk37(v):
    if v == "?": return '<div style="width:60px; height:60px; border-radius:50%; background:#142e56; color:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:bold;">?</div>'
    return f'<div style="width:60px; height:60px; border-radius:50%; border:2px solid #142e56; background:#fff; color:#142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold;">{v}</div>'
q37_h = f'<div style="display:grid; grid-template-columns: 60px 60px 60px; gap: 20px; justify-content:center; margin: 20px auto;">{mk37(43)}{mk37(42)}{mk37(40)}{mk37(37)}{mk37(33)}{mk37(28)}{mk37(22)}{mk37(15)}{mk37("?")}</div>'
q37_o = f"['{mk37(10)}', '{mk37(7)}', '{mk37(8)}', '{mk37(21)}', '{mk37(5)}', '{mk37(14)}']"

import math
svg38 = '<svg width="240" height="240" viewBox="0 0 240 240" style="margin:0 auto; display:block;"><circle cx="120" cy="120" r="110" fill="none" stroke="#142e56" stroke-width="4"/>'
for i in range(5):
    ba = math.radians(-90 + i*72)
    svg38 += f'<line x1="120" y1="120" x2="{120 + 110*math.cos(ba)}" y2="{120 + 110*math.sin(ba)}" stroke="#142e56" stroke-width="4"/>'
for val, deg in [("15", -54), ("18", 18), ("21", 90), ("?", 162), ("12", 234)]:
    ang = math.radians(deg)
    tx, ty = 120 + 70*math.cos(ang), 120 + 70*math.sin(ang) + 12
    if val == '?':
        svg38 += f'<circle cx="{tx}" cy="{ty-12}" r="22" fill="#2e1065"/><text x="{tx}" y="{ty-6}" text-anchor="middle" font-size="28" font-weight="bold" fill="#fff">?</text>'
    else:
        svg38 += f'<text x="{tx}" y="{ty}" text-anchor="middle" font-size="36" font-weight="bold" fill="#38bdf8">{val}</text>'
svg38 += '</svg>'
q38_h = f'<div style="width:240px; margin:20px auto;">{svg38}</div>'
def o38(v): return f'<svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="none" stroke="#142e56" stroke-width="2"/><text x="30" y="40" text-anchor="middle" font-size="28" font-weight="bold" fill="#38bdf8">{v}</text></svg>'
q38_o = f"['{o38(28)}', '{o38(25)}', '{o38(26)}', '{o38(23)}', '{o38(24)}', '{o38(22)}']"

def s39_i(t):
    if t=='sq': return '<rect x="18" y="18" width="24" height="24" fill="#38bdf8"/>'
    elif t=='tr': return '<polygon points="30,14 16,38 44,38" fill="#38bdf8"/>'
    elif t=='x': return '<line x1="10" y1="10" x2="50" y2="50" stroke="#142e56" stroke-width="3"/><line x1="50" y1="10" x2="10" y2="50" stroke="#142e56" stroke-width="3"/>'
    elif t=='cross': return '<line x1="30" y1="4" x2="30" y2="56" stroke="#142e56" stroke-width="3"/><line x1="4" y1="30" x2="56" y2="30" stroke="#142e56" stroke-width="3"/>'
    elif t=='dia': return '<polygon points="30,16 16,30 30,44 44,30" fill="#38bdf8"/>'
    return ""
def mk39(o, i):
    if o=='?': return '<svg width="60" height="60"><rect x="0" y="0" width="60" height="60" fill="#142e56"/><text x="30" y="42" text-anchor="middle" font-size="40" font-weight="bold" fill="#f59e0b">?</text></svg>'
    inner = s39_i(i)
    if o=='sq': outer = '<rect x="4" y="4" width="52" height="52" fill="none" stroke="#142e56" stroke-width="3"/>'
    elif o=='circ': outer = '<circle cx="30" cy="30" r="26" fill="none" stroke="#142e56" stroke-width="3"/>'
    elif o=='ast': outer = '<line x1="30" y1="4" x2="30" y2="56" stroke="#142e56" stroke-width="3"/><line x1="4" y1="30" x2="56" y2="30" stroke="#142e56" stroke-width="3"/><line x1="12" y1="12" x2="48" y2="48" stroke="#142e56" stroke-width="3"/><line x1="48" y1="12" x2="12" y2="48" stroke="#142e56" stroke-width="3"/>'
    elif o=='cross': outer = '<line x1="30" y1="4" x2="30" y2="56" stroke="#142e56" stroke-width="3"/><line x1="4" y1="30" x2="56" y2="30" stroke="#142e56" stroke-width="3"/>'
    elif o=='dia_h': outer = '<polygon points="30,4 4,30 30,56 56,30" fill="none" stroke="#142e56" stroke-width="3"/>'
    return f'<svg width="60" height="60" viewBox="0 0 60 60">{outer}{inner}</svg>'
q39_h = f'<div style="display:grid; grid-template-columns: 60px 60px 60px; gap: 20px; justify-content:center; margin: 20px auto;">{mk39("sq","sq")}{mk39("ast","")}{mk39("circ","tr")}{mk39("cross","tr")}{mk39("circ","sq")}{mk39("sq","x")}{mk39("circ","cross")}{mk39("sq","tr")}{mk39("?","")}</div>'
q39_o = f"['{mk39('circ','dia')}', '{mk39('dia_h','cross')}', '{mk39('dia_h','sq')}', '{mk39('sq','cross')}', '{mk39('cross','sq')}', '{mk39('circ','cross')}']"

def hk(cx, cy, txt, is_b):
    pts = f"{cx},{cy-20} {cx+17.3},{cy-10} {cx+17.3},{cy+10} {cx},{cy+20} {cx-17.3},{cy+10} {cx-17.3},{cy-10}"
    if txt=='?': return f'<polygon points="{pts}" fill="#142e56"/><text x="{cx}" y="{cy+8}" text-anchor="middle" font-size="24" font-weight="bold" fill="#fff">?</text>'
    return f'<polygon points="{pts}" fill="{'#fff' if is_b else '#38bdf8'}" stroke="#142e56" stroke-width="2"/><text x="{cx}" y="{cy+6}" text-anchor="middle" font-size="20" font-weight="bold" fill="{'#38bdf8' if is_b else '#fff'}">{txt}</text>'
def hc(t, l, r, b):
    cx, cy = 55, 25
    return f'<svg width="110" height="110" viewBox="0 0 110 110" style="margin: 0 10px;">{hk(cx,cy,t,False)}{hk(cx-17.3,cy+30,l,False)}{hk(cx+17.3,cy+30,r,False)}{hk(cx,cy+60,b,b!="?")}</svg>'
q40_h = f'<div style="display:flex; flex-direction:row; justify-content:center; flex-wrap:wrap; margin: 20px auto; width: max-content;">{hc(4,3,5,12)}{hc(3,1,1,5)}</div><div style="display:flex; justify-content:center; margin-top:-10px;">{hc(6,5,7,"?")}</div>'
def mk40_o(v): return f'<svg width="60" height="60" viewBox="0 0 60 60">{hk(30,30,v,True)}</svg>'
q40_o = f"['{mk40_o(15)}', '{mk40_o(16)}', '{mk40_o(17)}', '{mk40_o(18)}', '{mk40_o(19)}', '{mk40_o(20)}']"

target = "frontend/static/iq_assessment.js"
with open(target, "r", encoding="utf-8") as f:
    js_code = f.read()

new_questions = f"""
    {{
        title: 'Select the missing tile:',
        source: 'Visual Patterns',
        customHtml: '{q36_h}',
        customOptsHtml: {q36_o},
        answer: 3, time: 90, exp: 'Logical combinations of nested corner lines.'
    }},
    {{
        title: 'Which number completes the grid?',
        source: 'Numerical Reasoning',
        customHtml: '{q37_h}',
        customOptsHtml: {q37_o},
        answer: 1, time: 90, exp: 'The difference between numbers decreases. Missing is 7'
    }},
    {{
        title: 'Which number completes the dial?',
        source: 'Numerical Reasoning',
        customHtml: '{q38_h}',
        customOptsHtml: {q38_o},
        answer: 4, time: 90, exp: 'Add 3 to each segment sequentially. Missing is 24.'
    }},
    {{
        title: 'Select the box that completes the sequence:',
        source: 'Visual Sequences',
        customHtml: '{q39_h}',
        customOptsHtml: {q39_o},
        answer: 1, time: 90, exp: 'Combine outer and inner symbols based on row patterns.'
    }},
    {{
        title: 'Which number completes the pattern?',
        source: 'Numerical Patterns',
        customHtml: '{q40_h}',
        customOptsHtml: {q40_o},
        answer: 3, time: 90, exp: 'The bottom number is the sum of the three top numbers. 5+6+7=18.'
    }}
"""

js_code = js_code.replace("];", new_questions + "];")
js_code = js_code.replace("slice(0, 35)", "slice(0, 40)")

with open(target, "w", encoding="utf-8") as f:
    f.write(js_code)

import urllib.request
target_html = "frontend/templates/iq_assessment.html"
with open(target_html, "r", encoding="utf-8") as f:
    html_code = f.read()
html_code = html_code.replace("span> / 35", "span> / 40")
html_code = html_code.replace("35 Questions", "40 Questions")
html_code = html_code.replace("35 minutes", "40 minutes")
with open(target_html, "w", encoding="utf-8") as f:
    f.write(html_code)
