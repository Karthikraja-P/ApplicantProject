import urllib.request
import re
import os

os.makedirs('frontend/static/images/iq', exist_ok=True)

urls = [
    'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612425529x766302366875854600/Q-17.svg',
    'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612448264x247045399738077700/Q-18.svg',
    'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619686527995x759109475628974100/Q4A%20%283%29.svg',
    'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1620306315972x996536499471051800/Q4A%20%284%29.svg'
]
filenames = ['q6_mod_a.svg', 'q6_mod_b.svg', 'q6_mod_c.svg', 'q6_mod_d.svg']

for url, filename in zip(urls, filenames):
    # Bubble URLs sometimes have spaces encoded as %20
    with urllib.request.urlopen(url) as resp:
        svg_code = resp.read().decode('utf-8')
    
    # We want a white background and clear thick outlines. 
    # Force the background of the SVG to be white and the shapes inside to have dark blue #142e56 outline and transparent or solid fill.
    svg_code = re.sub(r'<style>.*?</style>', '<style> * { fill: none !important; stroke: #142e56 !important; stroke-width: 15px !important; } rect { fill: white !important; } </style>', svg_code, flags=re.DOTALL)
    
    with open(f'frontend/static/images/iq/{filename}', 'w', encoding='utf-8') as f:
        f.write(svg_code)

# Restore iq_assessment.js and link new svgs
js_file = 'frontend/static/iq_assessment.js'
with open(js_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the URLs in Q6 (index 5)
q6_old = """        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612425529x766302366875854600/Q-17.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612448264x247045399738077700/Q-18.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619686527995x759109475628974100/Q4A%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1620306315972x996536499471051800/Q4A%20%284%29.svg'
        ]"""
q6_new = """        imgOpts: [
            '/static/images/iq/q6_mod_a.svg',
            '/static/images/iq/q6_mod_b.svg',
            '/static/images/iq/q6_mod_c.svg',
            '/static/images/iq/q6_mod_d.svg'
        ]"""

content = content.replace(q6_old, q6_new)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Downloaded modified SVGs and updated JS logic for Q6.")
