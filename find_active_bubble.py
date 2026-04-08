import re, quopri, sys
from pathlib import Path

def find_active_images(fpath):
    with open(fpath, 'rb') as f: raw = f.read()
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return None
    boundary = b'--' + bm.group(1)
    
    html = ""
    for part in raw.split(boundary):
        if b'text/html' in part[:200]:
            html = quopri.decodestring(part[part.find(b'\r\n\r\n')+4:]).decode('utf-8', errors='ignore')
            break
    if not html: return None

    # Step 1: Find all Group divs
    # Heuristic: the top level question container usually has no display: none
    # and includes the N/20 indicator.
    
    # Let's find ALL <div class="bubble-element Group..." that DON'T have display: none
    matches = re.finditer(r'<div class="bubble-element Group[^"]*" style="([^"]+)">', html, re.DOTALL)
    
    for m in matches:
        style = m.group(1)
        if 'display: none' in style: continue
        
        # Look for the content within this group
        # This is difficult because we don't have a real DOM parser. 
        # But we can try to find the N/20 label in the following text.
        snippet = html[m.start():m.start()+20000]
        labelm = re.search(r'<div class="content">(\d+)/20</div>', snippet)
        if labelm:
            qnum = labelm.group(1)
            # Find images in this specific group snippet
            # We look for Image divs that also don't have display: none
            imgs = []
            img_matches = re.finditer(r'<div class="bubble-element Image[^"]*" style="([^"]+)">.*?<img[^>]*src="([^"]+)"', snippet, re.DOTALL)
            for im in img_matches:
                istyle = im.group(1)
                isrc = im.group(2)
                if 'display: none' in istyle: continue
                if 'bubble.io' in isrc and 'cdn-cgi' not in isrc:
                    imgs.append(isrc)

            if len(imgs) >= 5: # Question + 4-6 options
                print(f"File {fpath.name}: Question {qnum} Found!")
                print(f"  Images: {imgs}")
                return qnum, imgs
    return None

if __name__ == "__main__":
    for arg in sys.argv[1:]:
        find_active_images(Path(arg))
