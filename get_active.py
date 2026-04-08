import re, quopri, sys

def get_active_images(fpath):
    with open(fpath, 'rb') as f: raw = f.read()
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return
    boundary = b'--' + bm.group(1)
    
    html = ""
    for part in raw.split(boundary):
        if b'text/html' in part[:200]:
            html = quopri.decodestring(part[part.find(b'\r\n\r\n')+4:]).decode('utf-8', errors='ignore')
            break
    if not html: return

    # In Bubble.io, all questions are preloaded but hidden.
    # The active one is inside a group that is visible.
    
    # 1. Find all instances of "current" question label display
    # (Actually just search for a large block with Images and no display: none)
    
    img_matches = list(re.finditer(r'<div class="bubble-element Image[^"]*" style="([^"]+)">.*?<img[^>]*src="([^"]+)"', html, re.DOTALL))
    
    visible_imgs = []
    for m in img_matches:
        style = m.group(1)
        src = m.group(2)
        if 'display: none' in style: continue
        if 'bubble.io' not in src: continue
        
        # Get coords
        top = re.search(r'top:\s*([\d.]+)px', style)
        left = re.search(r'left:\s*([\d.]+)px', style)
        t = float(top.group(1)) if top else 0
        l = float(left.group(1)) if left else 0
        
        visible_imgs.append({'src': src, 'top': t, 'left': l})

    print(f"\n--- {fpath} ---")
    if not visible_imgs:
        print("No matches")
        return

    # Usually there is a set of ~5 images for the active question.
    # They should be close in coordinates or share a specific layout.
    
    # Let's filter for those with top < 500 (the test main area)
    visible_imgs = [i for i in visible_imgs if i['top'] < 1000]
    
    for vi in sorted(visible_imgs, key=lambda x: (x['top'], x['left'])):
        print(f"  ({vi['left']}, {vi['top']}) -> {vi['src']}")

if __name__ == "__main__":
    for i in range(11, 16):
        get_active_images(f"/home/pkr/ApplicantProject/new questions/{i}.mhtml")
