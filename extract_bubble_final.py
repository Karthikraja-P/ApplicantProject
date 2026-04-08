import re, quopri, sys
from pathlib import Path

def find_active_images(fpath, qnum):
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
    
    target = f">{qnum}/20</div>"
    idx = html.find(target)
    if idx == -1: return
    
    print(f"\n--- {fpath.name} | Q{qnum} ---")
    # Search for all Image divs in the WHOLE file, but filter for ones that are likely part of this group.
    # Bubble.io elements are often preloaded in order. 
    # Let's find the Nth cluster of images.
    
    # Actually, let's just find the first LARGE image after the label.
    # And then the 4-6 clickable images that follow.
    
    snippet = html[idx:idx+100000] # huge snippet
    
    images = []
    # Pattern to find images and their properties
    matches = re.finditer(r'<div class="bubble-element Image[^"]*" style="([^"]+)">.*?<img[^>]*src="([^"]+)"', snippet, re.DOTALL)
    
    for m in matches:
        style = m.group(1)
        src = m.group(2)
        if 'bubble.io' not in src: continue
        
        is_clickable = 'clickable-element' in m.group(0)
        width = re.search(r'width:\s*([\d.]+)px', style)
        w = float(width.group(1)) if width else 0
        
        images.append({'src': src, 'clickable': is_clickable, 'width': w})
    
    # Pick first non-clickable with w >= 200 as MAIN
    main = None
    for img in images:
        if not img['clickable'] and img['width'] >= 200:
            main = img['src']
            break
            
    # Options come after main
    options = []
    if main:
        main_idx = -1
        for i, img in enumerate(images):
            if img['src'] == main:
                main_idx = i
                break
        
        # Next 4-6 clickable ones
        for img in images[main_idx+1:]:
            if img['clickable']:
                options.append(img['src'])
                if len(options) == 6: break
    
    print(f"Main: {main}")
    print(f"Options ({len(options)}): {options}")

if __name__ == "__main__":
    import pathlib
    files = sorted(list(pathlib.Path('/home/pkr/ApplicantProject/new questions').glob('1[1-5].mhtml')))
    for f in files:
        # For each file, we look for ITS number
        qnum = int(f.stem)
        find_active_images(f, qnum)
