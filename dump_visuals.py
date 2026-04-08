import re, quopri, sys
from pathlib import Path

def extract_all_visuals(fpath):
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

    # Find ALL Text elements and their coordinates
    # <div class="bubble-element Text..." style="...">...<div class="content">...</div></div>
    text_matches = re.finditer(r'<div class="bubble-element Text[^"]*" style="([^"]+)">.*?<div class="content">(.*?)</div>', html, re.DOTALL)
    texts = []
    for m in text_matches:
        style, content = m.groups()
        if 'display: none' in style: continue
        top = re.search(r'top:\s*([\d.]+)px', style)
        left = re.search(r'left:\s*([\d.]+)px', style)
        texts.append({'content': content, 'top': float(top.group(1)) if top else 0, 'left': float(left.group(1)) if left else 0})

    # Find ALL Image elements and their coordinates
    img_matches = re.finditer(r'<div class="bubble-element Image[^"]*" style="([^"]+)">.*?<img[^>]*src="([^"]+)"', html, re.DOTALL)
    imgs = []
    for m in img_matches:
        style, src = m.groups()
        if 'display: none' in style: continue
        if 'bubble.io' not in src or 'cdn-cgi' in src: continue
        top = re.search(r'top:\s*([\d.]+)px', style)
        left = re.search(r'left:\s*([\d.]+)px', style)
        width = re.search(r'width:\s*([\d.]+)px', style)
        imgs.append({'src': src, 'top': float(top.group(1)) if top else 0, 'left': float(left.group(1)) if left else 0, 'width': float(width.group(1)) if width else 0})

    print(f"\n=== {fpath.name} ===")
    print("VISIBLE TEXTS:")
    for t in sorted(texts, key=lambda x: (x['top'], x['left'])):
        print(f"  ({t['left']}, {t['top']}) -> {t['content']}")
        
    print("VISIBLE IMAGES:")
    for i in sorted(imgs, key=lambda x: (x['top'], x['left'])):
        print(f"  ({i['left']}, {i['top']}) W:{i['width']} -> {i['src']}")

if __name__ == "__main__":
    for f in [11, 12, 13, 14, 15]:
        extract_all_visuals(Path(f"/home/pkr/ApplicantProject/new questions/{f}.mhtml"))
