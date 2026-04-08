import re, quopri, sys

def find_visible_images(fpath):
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
    
    # regex for div and img
    # Pattern: <div class="bubble-element Image..." style="..."><img src="...">
    matches = re.finditer(r'<div class="bubble-element Image[^"]*" style="([^"]+)">.*?<img[^>]*src="([^"]+)"', html, re.DOTALL)
    
    print(f"--- {fpath} ---")
    visible_found = 0
    for m in matches:
        style = m.group(1)
        src = m.group(2)
        if 'display: none' in style: continue
        if 'bubble.io' not in src: continue
        
        top = re.search(r'top:\s*([\d.]+)px', style)
        left = re.search(r'left:\s*([\d.]+)px', style)
        width = re.search(r'width:\s*([\d.]+)px', style)
        height = re.search(r'height:\s*([\d.]+)px', style)
        
        t = top.group(1) if top else '?'
        l = left.group(1) if left else '?'
        w = width.group(1) if width else '?'
        h = height.group(1) if height else '?'
        
        is_clickable = 'clickable-element' in m.group(0)
        print(f"Pos: ({l}, {t}) Size: {w}x{h} | Clickable: {is_clickable} | Src: {src}")
        visible_found += 1
    
    if visible_found == 0:
        print("No visible images found in standard Bubble format. Checking alternative...")

if __name__ == "__main__":
    for arg in sys.argv[1:]:
        find_visible_images(arg)
