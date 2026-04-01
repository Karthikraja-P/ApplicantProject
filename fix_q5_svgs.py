import urllib.request
import re
import os

os.makedirs('frontend/static/images/iq', exist_ok=True)

urls = [
    'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612300104x964109325700997000/Q-13.svg',
    'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612312475x204553183506439580/Q-14.svg'
]
filenames = ['q5_mod_b.svg', 'q5_mod_c.svg']

for url, filename in zip(urls, filenames):
    with urllib.request.urlopen(url) as resp:
        svg_code = resp.read().decode('utf-8')
    
    # Force the shapes to have a dark blue stroke #142e56, and a white fill for the container rect.
    svg_code = re.sub(r'<style>.*?</style>', '<style> * { fill: none !important; stroke: #142e56 !important; stroke-width: 15px !important; } rect { fill: white !important; } </style>', svg_code, flags=re.DOTALL)
    
    with open(f'frontend/static/images/iq/{filename}', 'w', encoding='utf-8') as f:
        f.write(svg_code)

# Restore iq_assessment.js and link new svgs
js_file = 'frontend/static/iq_assessment.js'
with open(js_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the URLs in Q5
q5_old = """        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612287573x889196537106714400/Q-12.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612300104x964109325700997000/Q-13.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612312475x204553183506439580/Q-14.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612351189x921323380661548400/Q-15.svg'
        ]"""
q5_new = """        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612287573x889196537106714400/Q-12.svg',
            '/static/images/iq/q5_mod_b.svg',
            '/static/images/iq/q5_mod_c.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612351189x921323380661548400/Q-15.svg'
        ]"""

content = content.replace(q5_old, q5_new)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Downloaded modified SVGs and updated JS logic for Q5.")
