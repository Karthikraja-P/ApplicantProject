import urllib.request
import re
import os

os.makedirs('frontend/static/images/iq', exist_ok=True)

urls = [
    'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612188661x664850454619189400/Q-07.svg',
    'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612220629x748943399782868100/Q-09.svg'
]
filenames = ['q4_mod_a.svg', 'q4_mod_c.svg']

for url, filename in zip(urls, filenames):
    with urllib.request.urlopen(url) as resp:
        svg_code = resp.read().decode('utf-8')
    
    # We want a white background and clear thick outlines. 
    # Force the background of the SVG to be white and the shapes inside to have dark blue #142e56 outline and transparent or solid fill.
    
    # Let's replace the <style> part with a bold dark stroke.
    svg_code = re.sub(r'<style>.*?</style>', '<style> * { fill: none !important; stroke: #142e56 !important; stroke-width: 15px !important; } rect { fill: white !important; } </style>', svg_code, flags=re.DOTALL)
    
    with open(f'frontend/static/images/iq/{filename}', 'w', encoding='utf-8') as f:
        f.write(svg_code)

# Restore iq_assessment.js and link new svgs
js_file = 'frontend/static/iq_assessment.js'
with open(js_file, 'r', encoding='utf-8') as f:
    content = f.read()

# First, revert the filter patch I added in `patch_q4_imgs.py`
patch_str = """var extraStyle = (idx === 3 && (i === 0 || i === 2)) ? "filter: brightness(0.6) contrast(200%); mix-blend-mode: multiply;" : "";
                btn.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><img src="' + url + '" style="width:100%;height:100%;max-width:64px;max-height:64px;object-fit:contain;border-radius:6px;background:#e2e8f0;padding:4px;' + extraStyle + '" /></div>' + '<div class="opt-label" style="text-align:center;">' + label + '</div>';"""

original_str = """btn.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><img src="' + url + '" style="width:100%;height:100%;max-width:64px;max-height:64px;object-fit:contain;border-radius:6px;background:#ffffff;padding:4px;" /></div>' + '<div class="opt-label" style="text-align:center;">' + label + '</div>';"""

if patch_str in content:
    content = content.replace(patch_str, original_str)
else:
    # Maybe background color was different
    content = re.sub(r'var extraStyle = .*?;\s*btn\.innerHTML = .*?;', original_str, content, flags=re.S)

# Now, replace the URLs in Q4 (index 3)
q4_old = """        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612188661x664850454619189400/Q-07.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612206726x152477936947297500/Q-08.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612220629x748943399782868100/Q-09.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612230359x380918791418798340/Q-10.svg'
        ]"""
q4_new = """        imgOpts: [
            '/static/images/iq/q4_mod_a.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612206726x152477936947297500/Q-08.svg',
            '/static/images/iq/q4_mod_c.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612230359x380918791418798340/Q-10.svg'
        ]"""

content = content.replace(q4_old, q4_new)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Downloaded modified SVGs and updated JS logic.")
