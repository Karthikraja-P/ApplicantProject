import re, quopri, sys
from pathlib import Path

def find_visible_now(fpath):
    with open(fpath, 'rb') as f: raw = f.read()
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return
    boundary = b'--' + bm.group(1)
    
    html = ''
    for part in raw.split(boundary):
        if b'text/html' in part[:200]:
            html = quopri.decodestring(part[part.find(b'\r\n\r\n')+4:]).decode('utf-8', errors='ignore')
            break
    if not html: return

    # Heuristic: the 'current' question in Bubble.io often is inside a div 
    # that doesn't have display: none.
    # But wait, sometimes it's nested.
    
    # We will look for elements that have a high z-index and are NOT display: none.
    # And specifically around the Q-N names.
    
    matches = list(re.finditer(r'<div class="bubble-element Image[^"]*" style="([^"]+)">.*?<img[^>]*src="([^"]+)"', html, re.DOTALL))
    visible = []
    for m in matches:
        style = m.group(1)
        src = m.group(2)
        if 'display: none' in style: continue
        if 'bubble.io' not in src: continue
        
        top = re.search(r'top:\s*([\d.]+)px', style)
        left = re.search(r'left:\s*([\d.]+)px', style)
        z = re.search(r'z-index:\s*(\d+)', style)
        
        visible.append({
            'src': src, 
            'top': float(top.group(1)) if top else 0, 
            'left': float(left.group(1)) if left else 0,
            'z': int(z.group(1)) if z else 0
        })

    print(f"\n--- {fpath.name} ---")
    # Sort by Z-index descending, then top, then left
    for v in sorted(visible, key=lambda x: (-x['z'], x['top'], x['left'])):
        print(f"  Z:{v['z']} | ({v['left']}, {v['top']}) -> {v['src']}")

if __name__ == "__main__":
    for f in [11, 12, 13, 14, 15]:
        find_visible_now(Path(f"/home/pkr/ApplicantProject/new questions/{f}.mhtml"))
