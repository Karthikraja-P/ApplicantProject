import re, quopri, sys
from pathlib import Path

def find_all_images(fpath):
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
    
    # 1. Find the question N label
    # Search for ">11/20</div>"
    for qn in range(11, 16):
        target = f">{qn}/20</div>"
        idx = html.find(target)
        if idx == -1: continue
        
        print(f"\n--- {fpath.name} | Question {qn} ---")
        # Bubble.io elements are often absolute positioned
        # In MHTML, they are usually in the DOM near each other if they belong together.
        
        # Grab snippet around label
        snippet = html[idx-1000:idx+20000]
        
        # Find all Images in snippet and their COORDS
        matches = re.finditer(r'<div class="bubble-element Image[^"]*" style="([^"]+)">.*?<img[^>]*src="([^"]+)"', snippet, re.DOTALL)
        for m in matches:
            style = m.group(1)
            src = m.group(2)
            if 'bubble.io' not in src: continue
            
            top = re.search(r'top:\s*([\d.]+)px', style)
            left = re.search(r'left:\s*([\d.]+)px', style)
            width = re.search(r'width:\s*([\d.]+)px', style)
            height = re.search(r'height:\s*([\d.]+)px', style)
            z = re.search(r'z-index:\s*(\d+)', style)
            
            t = float(top.group(1)) if top else 0
            l = float(left.group(1)) if left else 0
            w = float(width.group(1)) if width else 0
            h = float(height.group(1)) if height else 0
            zi = int(z.group(1)) if z else 0
            
            disp = "NONE" if "display: none" in style else "SHOW"
            is_clickable = 'clickable-element' in m.group(0)
            
            print(f"{disp} | Z:{zi} | Pos: ({l}, {t}) Size: {w}x{h} | Clickable: {is_clickable} | Src: {src}")

if __name__ == "__main__":
    for arg in sys.argv[1:]:
        find_all_images(Path(arg))
